(function () {
  var productEventName = 'alfeto:generated-product-fields';

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
        if (selectedValue && selectedValue.textContent.trim()) return selectedValue.textContent.trim();
      }
    }
    return '';
  }

  function readEntryValue(entry, path) {
    if (!entry || typeof entry.getIn !== 'function') return '';
    var value = entry.getIn(path);
    return typeof value === 'string' ? value.trim() : '';
  }

  function createGeneratedControl(widgetName, fieldName) {
    var widget = CMS.resolveWidget(widgetName);
    var BaseControl = widget && widget.control;
    if (!BaseControl) return null;

    return createClass({
      getInitialState: function () {
        return { controlVersion: 0 };
      },

      componentDidMount: function () {
        window.addEventListener(productEventName, this.handleGeneratedProduct);
      },

      componentWillUnmount: function () {
        window.removeEventListener(productEventName, this.handleGeneratedProduct);
      },

      handleGeneratedProduct: function (event) {
        var fields = event.detail || {};
        if (!Object.prototype.hasOwnProperty.call(fields, fieldName)) return;
        this.props.onChange(fields[fieldName]);
        this.setState({ controlVersion: this.state.controlVersion + 1 });
      },

      render: function () {
        return h(BaseControl, Object.assign({}, this.props, { key: this.state.controlVersion }));
      },
    });
  }

  var AISlugControl = createGeneratedControl('string', 'slug');
  var AIDescriptionControl = createGeneratedControl('text', 'description');
  var AISpecificationsControl = createGeneratedControl('list', 'spesifikasi');

  var AIProductTitleControl = createClass({
    getInitialState: function () {
      return { loading: false, message: '', error: false };
    },

    generateProduct: async function () {
      var title = (typeof this.props.value === 'string' && this.props.value.trim())
        || readCurrentField('Nama Produk');
      var category = readCurrentField('Kategori') || readEntryValue(this.props.entry, ['data', 'category']);
      var description = readEntryValue(this.props.entry, ['data', 'description']);

      if (!title || !category) {
        this.setState({ message: 'Isi nama produk dan pilih kategori terlebih dahulu.', error: true });
        return;
      }

      this.setState({ loading: true, message: '⏳ Generating...', error: false });
      try {
        var response = await fetch('/api/generate-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title, category: category, description: description }),
        });
        var result = await response.json();
        if (!response.ok) {
          throw new Error(typeof result.error === 'string' ? result.error : 'Produk gagal dibuat.');
        }
        if (
          typeof result.slug !== 'string' ||
          typeof result.title !== 'string' ||
          typeof result.description !== 'string' ||
          !Array.isArray(result.spesifikasi)
        ) {
          throw new Error('Server tidak mengembalikan field produk yang lengkap.');
        }

        this.props.onChange(result.title);
        window.dispatchEvent(new CustomEvent(productEventName, { detail: result }));
        this.setState({ message: '✅ Berhasil!', error: false });
      } catch (error) {
        this.setState({
          message: error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat produk.',
          error: true,
        });
      } finally {
        this.setState({ loading: false });
      }
    },

    render: function () {
      var BaseControl = CMS.resolveWidget('string').control;
      return h(
        'div',
        null,
        h(BaseControl, this.props),
        h(
          'div',
          { style: { marginTop: '8px' } },
          h(
            'button',
            {
              type: 'button',
              disabled: this.state.loading,
              onClick: this.generateProduct,
              style: {
                background: '#2563eb',
                border: 0,
                borderRadius: '4px',
                color: '#fff',
                cursor: this.state.loading ? 'wait' : 'pointer',
                font: 'inherit',
                opacity: this.state.loading ? 0.65 : 1,
                padding: '8px 12px',
              },
            },
            this.state.loading ? '⏳ Generating...' : '🤖 AI Generate Semua Field',
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
      );
    },
  });

  CMS.registerWidget('ai-product-title', AIProductTitleControl);
  if (AISlugControl) CMS.registerWidget('ai-product-slug', AISlugControl);
  if (AIDescriptionControl) CMS.registerWidget('ai-product-description', AIDescriptionControl);
  if (AISpecificationsControl) CMS.registerWidget('ai-product-specifications', AISpecificationsControl);
})();