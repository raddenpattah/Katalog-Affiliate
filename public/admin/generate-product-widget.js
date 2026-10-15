(function () {
  var productEventName = 'alfeto:generated-product-fields';
  var kebabCasePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;


  function readDomTextarea(labelHint) {
    var labels = document.querySelectorAll('label');
    var hint = labelHint.toLowerCase();
    for (var i = 0; i < labels.length; i++) {
      var lbl = labels[i];
      if (lbl.textContent.trim().toLowerCase().indexOf(hint) === -1) continue;
      var container = lbl.closest('div') || lbl.parentElement;
      while (container) {
        var ta = container.querySelector('textarea');
        if (ta && typeof ta.value === 'string' && ta.value.trim()) return ta.value.trim();
        container = container.parentElement;
      }
    }
    var all = document.querySelectorAll('textarea');
    var best = '';
    for (var j = 0; j < all.length; j++) {
      if (all[j].value && all[j].value.trim().length > best.length) best = all[j].value.trim();
    }
    return best;
  }

  function readDomSelect(labelHint) {
    var labels = document.querySelectorAll('label');
    var hint = labelHint.toLowerCase();
    for (var i = 0; i < labels.length; i++) {
      var lbl = labels[i];
      if (lbl.textContent.trim().toLowerCase().indexOf(hint) === -1) continue;
      var container = lbl.closest('div') || lbl.parentElement;
      while (container) {
        var sel = container.querySelector('select, [role="combobox"]');
        if (sel) return (sel.value || sel.textContent || '').trim();
        container = container.parentElement;
      }
    }
    return '';
  }

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

  function hasEntryValue(entry, path) {
    if (!entry || typeof entry.getIn !== 'function') return false;
    var value = entry.getIn(path);
    if (typeof value === 'string') return Boolean(value.trim());
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value && typeof value.size === 'number' && value.size > 0);
  }

  function getSessionToken() {
    try {
      var session = JSON.parse(window.localStorage.getItem('decap-cms-user') || 'null');
      if (session && typeof session.token === 'string' && session.token.trim()) {
        return session.token.trim();
      }
      if (session && typeof session.access_token === 'string' && session.access_token.trim()) {
        return session.access_token.trim();
      }
    } catch (error) {
      return '';
    }
    return '';
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

  var AIIdControl = createClass({
    getInitialState: function () {
      var data = this.props.entry && this.props.entry.getIn
        ? this.props.entry.getIn(['data', 'id'])
        : '';
      var originalId = typeof data === 'string' ? data : '';
      return {
        originalId: originalId,
        draftId: typeof this.props.value === 'string' ? this.props.value : originalId,
        error: '',
      };
    },

    componentWillReceiveProps: function (nextProps) {
      if (nextProps.value !== this.props.value && nextProps.value !== this.state.draftId) {
        this.setState({ draftId: typeof nextProps.value === 'string' ? nextProps.value : '' });
      }
    },

    handleChange: function (value) {
      this.setState({ draftId: value });
      if (value === this.state.originalId || value === '' || kebabCasePattern.test(value)) {
        this.setState({ error: '' });
        this.props.onChange(value);
        return;
      }
      this.setState({ error: 'ID baru harus memakai kebab-case huruf kecil dan angka.' });
    },

    handleBlur: function () {
      var value = this.state.draftId;
      if (value === this.state.originalId || value === '' || kebabCasePattern.test(value)) return;
      this.setState({
        draftId: typeof this.props.value === 'string' ? this.props.value : '',
        error: 'ID baru harus memakai kebab-case huruf kecil dan angka.',
      });
    },

    render: function () {
      var BaseControl = CMS.resolveWidget('string').control;
      return h(
        'div',
        null,
        h(
          BaseControl,
          Object.assign({}, this.props, {
            value: this.state.draftId,
            onBlur: this.handleBlur,
            onChange: this.handleChange,
          }),
        ),
        h(
          'p',
          { role: this.state.error ? 'alert' : undefined, style: { color: '#78716c', fontSize: '12px', margin: '4px 0 0' } },
          this.state.error || 'Gunakan kebab-case huruf kecil untuk ID baru. ID lama dapat dipertahankan tanpa perubahan.',
        ),
      );
    },
  });

  var AITitleControl = createGeneratedControl('string', 'title');
  var AISlugControl = createGeneratedControl('string', 'slug');
  var AIDescriptionControl = createGeneratedControl('text', 'description');
  var AIMetaDescriptionControl = createGeneratedControl('text', 'metaDescription');
  var AISpecificationsControl = createGeneratedControl('list', 'specs');

  var AIPinterestTitleControl = createClass({
    getInitialState: function () {
      return {
        loading: false,
        message: '',
        error: false,
        perluDilengkapi: [],
        sourceDescription: '',
        generatedDescription: '',
        sourceTitle: '',
        generatedTitle: '',
      };
    },

    generateProduct: async function () {
      var entry = this.props.entry;
      var currentTitle = readCurrentField('Nama Produk') || readEntryValue(entry, ['data', 'title']);
      var title = this.state.generatedTitle === currentTitle ? this.state.sourceTitle : currentTitle;
      var category = readCurrentField('Kategori') || readEntryValue(entry, ['data', 'category']) || readDomSelect('Kategori');
      var currentDescription = readCurrentField('Deskripsi Produk') || readEntryValue(entry, ['data', 'description']) || readDomTextarea('DESKRIPSI PRODUK');
      var description = this.state.generatedDescription === currentDescription
        ? this.state.sourceDescription
        : currentDescription;

      if (description.length < 80) {
        this.setState({
          message: 'tempel deskripsi Shopee dulu (minimal 80 karakter).',
          error: true,
        });
        return;
      }
      if (!title || !category) {
        this.setState({ message: 'Isi nama produk dan pilih kategori terlebih dahulu.', error: true });
        return;
      }

      var hasGeneratedValues = [
        hasEntryValue(entry, ['data', 'title']),
        hasEntryValue(entry, ['data', 'titlePinterest']),
        hasEntryValue(entry, ['data', 'slug']),
        hasEntryValue(entry, ['data', 'description']),
        hasEntryValue(entry, ['data', 'metaDescription']),
        hasEntryValue(entry, ['data', 'specs']),
      ].some(Boolean);
      if (hasGeneratedValues && !window.confirm('Konten AI akan mengganti judul, slug, deskripsi, meta description, dan specs yang sudah terisi. Lanjutkan?')) {
        this.setState({ message: 'Generate dibatalkan; isi yang ada tetap dipertahankan.', error: false });
        return;
      }

      var token = getSessionToken();
      if (!token) {
        this.setState({
          message: 'Token GitHub Decap tidak ditemukan. Coba login ulang ke CMS.',
          error: true,
        });
        return;
      }

      this.setState({ loading: true, message: '⏳ Generating...', error: false, perluDilengkapi: [] });
      try {
        var response = await fetch('/api/generate-product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({
            title: title,
            category: category,
            description: description,
          }),
        });
        var result = await response.json();
        if (!response.ok) {
          throw new Error(typeof result.error === 'string' ? result.error : 'Produk gagal dibuat.');
        }
        if (
          typeof result.title !== 'string' ||
          typeof result.titlePinterest !== 'string' ||
          typeof result.slug !== 'string' ||
          typeof result.description !== 'string' ||
          typeof result.metaDescription !== 'string' ||
          !Array.isArray(result.specs) ||
          !Array.isArray(result.perluDilengkapi)
        ) {
          throw new Error('Server tidak mengembalikan field produk dengan format lengkap.');
        }

        this.props.onChange(result.titlePinterest);
        window.dispatchEvent(new CustomEvent(productEventName, { detail: result }));
        this.setState({
          message: '✅ Berhasil! Periksa hasil dan catatan kelengkapan sebelum menyimpan.',
          error: false,
          perluDilengkapi: result.perluDilengkapi,
          sourceDescription: description,
          generatedDescription: result.description,
          sourceTitle: title,
          generatedTitle: result.title,
        });
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
          this.state.perluDilengkapi.length
            ? h(
                'div',
                { style: { background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '4px', marginTop: '8px', padding: '10px' } },
                h('strong', {}, 'Perlu dilengkapi:'),
                h(
                  'ul',
                  { style: { listStyle: 'disc', margin: '6px 0 0', paddingLeft: '20px' } },
                  this.state.perluDilengkapi.map(function (item, index) {
                    return h('li', { key: index }, item);
                  }),
                ),
              )
            : null,
        ),
      );
    },
  });

  CMS.registerWidget('ai-product-id', AIIdControl);
  CMS.registerWidget('ai-product-title-pinterest', AIPinterestTitleControl);
  if (AITitleControl) CMS.registerWidget('ai-product-title', AITitleControl);
  if (AISlugControl) CMS.registerWidget('ai-product-slug', AISlugControl);
  if (AIDescriptionControl) CMS.registerWidget('ai-product-description', AIDescriptionControl);
  if (AIMetaDescriptionControl) CMS.registerWidget('ai-product-meta-description', AIMetaDescriptionControl);
  if (AISpecificationsControl) CMS.registerWidget('ai-product-specifications', AISpecificationsControl);
})();
