(function () {
  var markdownWidget = CMS.resolveWidget('markdown');
  var MarkdownControl = markdownWidget && markdownWidget.control;

  function readCurrentField(labelText) {
    var labels = document.querySelectorAll('label');
    for (var index = 0; index < labels.length; index += 1) {
      var label = labels[index];
      if (label.textContent.trim() !== labelText) continue;

      var control = label.htmlFor ? document.getElementById(label.htmlFor) : null;
      if (!control && label.parentElement) {
        control = label.parentElement.querySelector('input, textarea, select, [role="combobox"]');
      }
      if (control && typeof control.value === 'string') return control.value.trim();
    }
    return '';
  }

  function readEntryValue(entry, path) {
    if (!entry || typeof entry.getIn !== 'function') return '';
    var value = entry.getIn(path);
    return typeof value === 'string' ? value.trim() : '';
  }

  var AIArticleControl = createClass({
    getInitialState: function () {
      return { loading: false, message: '', error: false };
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

      this.setState({ loading: true, message: '', error: false });
      try {
        var response = await fetch('/api/generate-blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title, category: category }),
        });
        var result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Artikel tidak dapat dibuat.');
        }
        if (typeof result.article !== 'string' || !result.article.trim()) {
          throw new Error('Server tidak mengembalikan isi artikel.');
        }

        this.props.onChange(result.article);
        this.setState({ message: 'Artikel berhasil dibuat. Periksa kembali sebelum menerbitkan.', error: false });
      } catch (error) {
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
        MarkdownControl ? h(MarkdownControl, this.props) : h('p', null, 'Editor Markdown tidak tersedia.'),
      );
    },
  });

  CMS.registerWidget('ai-markdown', AIArticleControl);
})();
