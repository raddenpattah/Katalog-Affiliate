const ProductCatalogPreview = createClass({
  render() {
    const products = this.props.widgetsFor('products');

    return h(
      'main',
      {
        style: {
          boxSizing: 'border-box',
          color: '#292524',
          fontFamily: 'system-ui, sans-serif',
          margin: '0 auto',
          maxWidth: '760px',
          padding: '20px',
        },
      },
      h('h1', { style: { fontSize: '22px', margin: '0 0 16px' } }, 'Katalog Produk'),
      products.map((product, index) => {
        const data = product.get('data');
        const imagePath = data.get('imageUrl');
        const image = imagePath ? this.props.getAsset(imagePath).toString() : '';
        const shopeeUrl = data.get('shopeeUrl');
        const badge = data.get('badge');

        return h(
          'article',
          {
            key: data.get('id') || index,
            style: {
              alignItems: 'flex-start',
              background: '#fff',
              border: '1px solid #e7e5e4',
              borderRadius: '10px',
              display: 'flex',
              gap: '14px',
              marginBottom: '12px',
              padding: '12px',
            },
          },
          image &&
            h('img', {
              src: image,
              alt: data.get('title') || '',
              style: {
                background: '#f5f5f4',
                border: '1px solid #e7e5e4',
                borderRadius: '8px',
                flex: '0 0 72px',
                height: '72px',
                objectFit: 'cover',
                width: '72px',
              },
            }),
          h(
            'div',
            { style: { minWidth: '0' } },
            h('h2', { style: { fontSize: '16px', margin: '0 0 6px' } }, data.get('title') || 'Produk baru'),
            h(
              'p',
              { style: { color: '#57534e', fontSize: '12px', lineHeight: '1.6', margin: '0' } },
              h('strong', {}, 'ID: '),
              data.get('id') || '-',
              ' · ',
              h('strong', {}, 'Kategori: '),
              data.get('category') || '-',
              h('br'),
              h('strong', {}, 'Gambar: '),
              imagePath || 'Belum dipilih',
              h('br'),
              h('strong', {}, 'Link Shopee: '),
              shopeeUrl
                ? h(
                    'a',
                    { href: shopeeUrl, rel: 'noopener noreferrer', target: '_blank' },
                    shopeeUrl,
                  )
                : 'Belum diisi',
              badge &&
                h(
                  'span',
                  {
                    style: {
                      background: '#f5f5f4',
                      borderRadius: '999px',
                      display: 'inline-block',
                      marginLeft: '8px',
                      padding: '2px 8px',
                    },
                  },
                  badge,
                ),
            ),
          ),
        );
      }),
    );
  },
});

CMS.registerPreviewTemplate('product_catalog', ProductCatalogPreview);
