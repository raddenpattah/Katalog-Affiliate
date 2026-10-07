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

  async function readArticleStream(response, onArticleText) {
    if (!response.body || typeof response.body.getReader !== 'function') {
      throw new Error('Browser ini tidak mendukung streaming artikel.');
    }

    var reader = response.body.getReader();
    var decoder = new TextDecoder();
    var buffer = '';
    var article = '';
    var metadata = null;
    var completed = false;

    function processLine(line) {
      if (!line.trim()) return;

      var event;
      try {
        event = JSON.parse(line);
      } catch (error) {
        throw new Error('Server mengirim potongan artikel dengan format yang tidak valid.');
      }

      if (event.type === 'article' && typeof event.text === 'string') {
        article += event.text;
        onArticleText(article);
      } else if (
        event.type === 'metadata' &&
        typeof event.description === 'string' &&
        Array.isArray(event.tags)
      ) {
        metadata = { description: event.description, tags: event.tags };
      } else if (event.type === 'error') {
        throw new Error(event.error || 'Artikel tidak dapat dibuat.');
      } else if (event.type === 'done') {
        completed = true;
      }
    }

    try {
      while (true) {
        var chunk = await reader.read();
        buffer += decoder.decode(chunk.value || new Uint8Array(), { stream: !chunk.done });

        var lines = buffer.split('\n');
        buffer = lines.pop();
        lines.forEach(processLine);

        if (chunk.done) break;
      }
      if (buffer.trim()) processLine(buffer);
    } finally {
      reader.releaseLock();
    }

    if (!completed || !article.trim() || !metadata || !metadata.description.trim()) {
      throw new Error('Server tidak mengembalikan artikel beserta metadata yang lengkap.');
    }

    return {
      article: article,
      description: metadata.description,
      tags: metadata.tags,
    };
  }

  function createMetadataControl(widgetName, metadataKey, isEmpty) {
    var widget = CMS.resolveWidget(widgetName);
    var BaseControl = widget && widget.control;
    if (!BaseControl) return null;

    return createClass({
      getInitialState: function () {
        return { controlVersion: 0 };
      },

      componentDidMount: function () {
        window.addEventListener(metadataEventName, this.handleGeneratedMetadata);
      },

      componentWillUnmount: function () {
        window.removeEventListener(metadataEventName, this.handleGeneratedMetadata);
      },

      handleGeneratedMetadata: function (event) {
        var value = event.detail && event.detail[metadataKey];
        if (value && isEmpty(this.props.value)) {
          this.props.onChange(value);
          this.setState({ controlVersion: this.state.controlVersion + 1 });
        }
      },

      render: function () {
        return h(BaseControl, Object.assign({}, this.props, { key: this.state.controlVersion }));
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
      var payload = { title: title, category: category };
      this.setState({ loading: true, message: 'Artikel sedang dibuat…', error: false });
      try {
        console.log('Payload sent to API:', payload);
        var res = await fetch('/api/generate-blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `HTTP error! status: ${res.status}`);
        }
        var result = await readArticleStream(res, function (articleText) {
          streamedArticle = true;
          this.props.onChange(articleText);
        }.bind(this));

        if (
          typeof result.article !== 'string' ||
          !result.article.trim() ||
          typeof result.description !== 'string' ||
          !result.description.trim() ||
          !Array.isArray(result.tags)
        ) {
          throw new Error('Server tidak mengembalikan artikel beserta metadata yang lengkap.');
        }

        this.setState({ pendingEditorValue: result.article }, function () {
          this.props.onChange(result.article);
          window.dispatchEvent(
            new CustomEvent(metadataEventName, {
              detail: { description: result.description, tags: result.tags },
            }),
          );
          this.setState({
            message: 'Artikel, deskripsi, dan tags dibuat. Field yang sudah terisi tetap dipertahankan.',
            error: false,
          });
        });
      } catch (error) {
        console.error('AI Generation Error Details:', error);
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
})();
