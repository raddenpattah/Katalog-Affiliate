(function () {
  var markdownWidget = CMS.resolveWidget('markdown');
  var MarkdownControl = markdownWidget && markdownWidget.control;
  var MarkdownPreview = markdownWidget && markdownWidget.preview;
  var metadataEventName = 'alfeto:generated-blog-metadata';

  function readCurrentField(labelText) {
    var labels = document.querySelectorAll('label');
    var expectedLabel = labelText.trim().toLocaleLowerCase();
    for (var index = 0; index < labels.length; index += 1) {
      var label = labels[index];
      if (label.textContent.trim().toLocaleLowerCase() !== expectedLabel) continue;

      var control = label.htmlFor ? document.getElementById(label.htmlFor) : null;
      if (!control && label.parentElement) {
        control = label.parentElement.querySelector('input, textarea, select, [role="combobox"]');
      }
      if (control && typeof control.value === 'string' && control.value.trim()) {
        return control.value.trim();
      }

      var container = label.parentElement;
      for (var level = 0; container && level < 4; level += 1, container = container.parentElement) {
        var selectedValue = container.querySelector(
          '[class*="SingleValue"], [class*="singleValue"], [class*="value-label"]',
        );
        if (selectedValue && selectedValue.textContent.trim()) {
          return selectedValue.textContent.trim();
        }
      }
    }
    return '';
  }

  function readEntryValue(entry, path) {
    if (!entry || typeof entry.getIn !== 'function') return '';
    var value = entry.getIn(path);
    return typeof value === 'string' ? value.trim() : '';
  }

  function processLine(line) {
    if (!line.trim()) return null;

    var event;
    try {
      event = JSON.parse(line);
    } catch (error) {
      throw new Error('Server mengirim potongan artikel dengan format yang tidak valid.', { cause: error });
    }

    if (!event || typeof event !== 'object' || typeof event.type !== 'string') {
      throw new Error('Server mengirim event artikel yang tidak valid.');
    }
    if (event.type === 'error') {
      throw new Error(typeof event.error === 'string' ? event.error : 'Artikel tidak dapat dibuat.');
    }
    return event;
  }

  async function readArticleStream(response, onArticleText) {
    if (!response.body || typeof response.body.getReader !== 'function') {
      throw new Error('Browser ini tidak mendukung streaming artikel.');
    }

    var reader = response.body.getReader();
    var decoder = new TextDecoder('utf-8');
    var buffer = '';
    var article = '';
    var metadata = null;
    var completed = false;

    function handleLine(line) {
      var event = processLine(line);
      if (!event) return;

      if (event.type === 'article' && typeof event.text === 'string') {
        article += event.text;
        onArticleText(article);
      } else if (
        event.type === 'metadata' &&
        typeof event.description === 'string' &&
        Array.isArray(event.tags)
      ) {
        metadata = {
          description: event.description,
          tags: event.tags,
          recommendedProductIds: Array.isArray(event.recommendedProductIds)
            ? event.recommendedProductIds
            : [],
          recommendedArticles: Array.isArray(event.recommendedArticles)
            ? event.recommendedArticles
            : [],
          ctaType: event.ctaType === 'product' || event.ctaType === 'article'
            ? event.ctaType
            : '',
        };
      } else if (event.type === 'done') {
        completed = true;
      }
    }

    try {
      while (true) {
        var { done, value } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

        var lines = buffer.split('\n');
        buffer = lines.pop();
        lines.forEach(handleLine);

        if (done) break;
      }
      if (buffer.trim()) handleLine(buffer);
    } finally {
      reader.releaseLock();
    }

    if (
      !completed ||
      !article.trim() ||
      !metadata ||
      !metadata.description.trim() ||
      metadata.recommendedProductIds.length < 3 ||
      metadata.recommendedArticles.length < 2 ||
      !metadata.ctaType
    ) {
      throw new Error('Server tidak mengembalikan artikel dan rekomendasi yang lengkap.');
    }

    return {
      article: article,
      description: metadata.description,
      tags: metadata.tags,
      recommendedProductIds: metadata.recommendedProductIds,
      recommendedArticles: metadata.recommendedArticles,
      ctaType: metadata.ctaType,
    };
  }

  async function generateArticle(payload, onArticleText) {
    var response = await fetch('/api/generate-blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      var errorDetails = 'HTTP Error ' + response.status;
      try {
        var errorData = await response.json();
        if (typeof errorData.error === 'string' && errorData.error) {
          errorDetails = errorData.error;
        }
      } catch (error) {
        // Keep the HTTP status when the error response is not JSON.
      }
      throw new Error(errorDetails);
    }

    return readArticleStream(response, onArticleText);
  }

  function toMultipleWidgetValue(value, currentValue) {
    if (
      currentValue &&
      typeof currentValue.clear === 'function' &&
      typeof currentValue.concat === 'function'
    ) {
      return currentValue.clear().concat(value);
    }
    return value;
  }

  function createMetadataControl(widgetName, metadataKey, isEmpty, formatValue) {
    var widget = CMS.resolveWidget(widgetName);
    var BaseControl = widget && widget.control;
    if (!BaseControl) return null;

    return createClass({
      getInitialState: function () {
        return { controlVersion: 0, selectedRelationHits: [] };
      },

      componentDidMount: function () {
        window.addEventListener(metadataEventName, this.handleGeneratedMetadata);
      },

      componentWillUnmount: function () {
        window.removeEventListener(metadataEventName, this.handleGeneratedMetadata);
      },

      handleGeneratedMetadata: function (event) {
        var value = event.detail && event.detail[metadataKey];
        var currentValue = this.props.value;
        var empty = isEmpty(currentValue);
        console.log('Set value for metadataKey:', metadataKey, value);
        console.log('Current field value:', currentValue);
        console.log('Value type:', typeof currentValue, currentValue?.constructor?.name);
        console.log('Is empty?', empty);

        if (value !== undefined && value !== null && empty) {
          console.log('Auto-fill field received:', metadataKey, value);
          var nextValue = formatValue ? formatValue(value, currentValue) : value;
          console.log('Auto-fill field value type:', metadataKey, nextValue?.constructor?.name);
          var selectedRelationHits = this.state.selectedRelationHits;
          if (metadataKey === 'recommendedProductIds') {
            var recommendedProducts = Array.isArray(event.detail.recommendedProducts)
              ? event.detail.recommendedProducts
              : [];
            selectedRelationHits = recommendedProducts
              .filter(function (product) {
                return product && value.includes(product.id);
              })
              .map(function (product) {
                return {
                  data: product,
                  slug: product.slug || product.id,
                  path: 'src/data/products/' + (product.slug || product.id) + '.json',
                };
              });
          }

          try {
            this.props.onChange(nextValue);
            console.log('onChange triggered for metadataKey:', metadataKey, nextValue);
          } catch (error) {
            console.error('onChange failed for metadataKey:', metadataKey, error);
            throw error;
          }
          this.setState({
            controlVersion: this.state.controlVersion + 1,
            selectedRelationHits: selectedRelationHits,
          });
        } else if (value !== undefined && value !== null) {
          console.log('Auto-fill skipped; field already has a value:', metadataKey);
        }
      },

      render: function () {
        var controlProps = Object.assign({}, this.props, { key: this.state.controlVersion });
        if (this.state.selectedRelationHits.length > 0) {
          var currentHits = Array.isArray(this.props.queryHits) ? this.props.queryHits : [];
          var hitIds = new Set(currentHits.map(function (hit) {
            return hit && hit.data && hit.data.id;
          }));
          controlProps.queryHits = currentHits.concat(this.state.selectedRelationHits.filter(function (hit) {
            return !hitIds.has(hit.data.id);
          }));
        }
        return h(BaseControl, controlProps);
      },
    });
  }

  var AIDescriptionControl = createMetadataControl('text', 'description', function (value) {
    return typeof value !== 'string' || !value.trim();
  });
  var AITagsControl = createMetadataControl('list', 'tags', function (value) {
    var tags = value && typeof value.toArray === 'function' ? value.toArray() : value;
    return !Array.isArray(tags) || tags.length === 0 || tags.every(function (tag) {
      return typeof tag !== 'string' || !tag.trim();
    });
  }, toMultipleWidgetValue);
  var AIProductIdsControl = createMetadataControl('relation', 'recommendedProductIds', function (value) {
    var items = value && typeof value.toArray === 'function' ? value.toArray() : value;
    return !Array.isArray(items) || items.length === 0;
  }, toMultipleWidgetValue);
  var AIInternalLinksControl = createMetadataControl('relation', 'recommendedArticles', function (value) {
    var items = value && typeof value.toArray === 'function' ? value.toArray() : value;
    return !Array.isArray(items) || items.length === 0;
  }, toMultipleWidgetValue);
  var AICTATypeControl = createMetadataControl('select', 'ctaType', function (value) {
    return value !== 'product' && value !== 'article';
  });

  var AIArticleControl = createClass({
    getInitialState: function () {
      return { loading: false, message: '', error: false, editorVersion: 0, pendingEditorValue: null };
    },

    componentDidUpdate: function () {
      if (this.state.pendingEditorValue && this.props.value === this.state.pendingEditorValue) {
        this.setState({
          editorVersion: this.state.editorVersion + 1,
          pendingEditorValue: null,
        });
      }
    },

    generateArticle: async function () {
      var title = readCurrentField('Judul') || readEntryValue(this.props.entry, ['data', 'title']);
      var category =
        readCurrentField('Kategori') ||
        readEntryValue(this.props.entry, ['data', 'advanced', 'category']);

      if (!title || !category) {
        this.setState({
          message: 'Isi judul dan pilih kategori di Pengaturan Lanjutan terlebih dahulu.',
          error: true,
        });
        return;
      }

      var previousArticle = typeof this.props.value === 'string' ? this.props.value : '';
      var streamedArticle = false;
      this.setState({ loading: true, message: 'Artikel sedang dibuat…', error: false });
      try {
        var dataResponses = await Promise.all([
          fetch('/api/data-provider?type=products'),
          fetch('/api/data-provider?type=blog'),
        ]);
        if (!dataResponses[0].ok || !dataResponses[1].ok) {
          throw new Error('Data produk atau artikel tidak dapat dimuat.');
        }
        var productsData = await dataResponses[0].json();
        var blogData = await dataResponses[1].json();
        if (
          !Array.isArray(productsData.products) ||
          productsData.products.length < 3 ||
          !Array.isArray(blogData.blog) ||
          blogData.blog.length < 2
        ) {
          throw new Error('Minimal 3 produk dan 2 artikel konteks diperlukan.');
        }
        var payload = {
          title: title,
          category: category,
          products: productsData.products,
          blogContext: blogData.blog,
        };
        console.log('Payload sent to API:', payload);
        var result = await generateArticle(payload, function (articleText) {
          streamedArticle = true;
          this.props.onChange(articleText);
        }.bind(this));

        if (
          typeof result.article !== 'string' ||
          !result.article.trim() ||
          typeof result.description !== 'string' ||
          !result.description.trim() ||
          !Array.isArray(result.tags) ||
          !Array.isArray(result.recommendedProductIds) ||
          result.recommendedProductIds.length < 3 ||
          !Array.isArray(result.recommendedArticles) ||
          result.recommendedArticles.length < 2 ||
          (result.ctaType !== 'product' && result.ctaType !== 'article')
        ) {
          throw new Error('Server tidak mengembalikan artikel beserta metadata yang lengkap.');
        }

        this.setState({ pendingEditorValue: result.article }, function () {
          this.props.onChange(result.article);
          window.dispatchEvent(
            new CustomEvent(metadataEventName, {
              detail: {
                description: result.description,
                tags: result.tags,
                recommendedProductIds: result.recommendedProductIds,
                recommendedProducts: productsData.products.filter(function (product) {
                  return result.recommendedProductIds.includes(product.id);
                }),
                recommendedArticles: result.recommendedArticles,
                ctaType: result.ctaType,
              },
            }),
          );
          console.log('Auto-fill productIds:', result.recommendedProductIds);
          console.log('Auto-fill internalLinks:', result.recommendedArticles);
          console.log('Auto-fill ctaType:', result.ctaType);
          this.setState({
            message: 'Artikel, metadata, dan rekomendasi dibuat. Field yang sudah terisi tetap dipertahankan.',
            error: false,
          });
        });
      } catch (error) {
        console.error('AI Generation Error Details:', error);
        alert('Gagal generate: ' + (error instanceof Error ? error.message : String(error)));
        if (streamedArticle) this.props.onChange(previousArticle);
        this.setState({
          message: error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat artikel.',
          error: true,
        });
      } finally {
        this.setState({ loading: false });
      }
    },

    render: function () {
      return h(
        'div',
        { className: this.props.classNameWrapper },
        h(
          'div',
          { style: { marginBottom: '12px' } },
          h(
            'button',
            {
              type: 'button',
              disabled: this.state.loading || !MarkdownControl,
              onClick: this.generateArticle,
              style: {
                background: '#2563eb',
                border: 0,
                borderRadius: '4px',
                color: '#fff',
                cursor: this.state.loading ? 'wait' : 'pointer',
                font: 'inherit',
                opacity: this.state.loading || !MarkdownControl ? 0.65 : 1,
                padding: '8px 12px',
              },
            },
            this.state.loading ? 'Sedang membuat artikel…' : '✨ Generate Artikel AI',
          ),
          this.state.message
            ? h(
                'p',
                {
                  role: this.state.error ? 'alert' : 'status',
                  style: {
                    color: this.state.error ? '#b91c1c' : '#166534',
                    margin: '8px 0 0',
                  },
                },
                this.state.message,
              )
            : null,
        ),
        MarkdownControl
          ? h(MarkdownControl, Object.assign({}, this.props, { key: this.state.editorVersion }))
          : h('p', null, 'Editor Markdown tidak tersedia.'),
      );
    },
  });

  CMS.registerWidget('ai-markdown', AIArticleControl, MarkdownPreview);
  if (AIDescriptionControl) CMS.registerWidget('ai-description', AIDescriptionControl);
  if (AITagsControl) CMS.registerWidget('ai-tags', AITagsControl);
  if (AIProductIdsControl) CMS.registerWidget('ai-product-ids', AIProductIdsControl);
  if (AIInternalLinksControl) CMS.registerWidget('ai-internal-links', AIInternalLinksControl);
  if (AICTATypeControl) CMS.registerWidget('ai-cta-type', AICTATypeControl);
})();
