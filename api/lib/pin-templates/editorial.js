// Template Pin "Editorial" — 1000 x 1500 px
// Magazine style: header tipis, judul besar serif, foto, sub-deskripsi.

export function renderEditorial({ title, imageDataUrl, category }) {
  const truncatedTitle = title.length > 100 ? title.slice(0, 97) + '...' : title;
  const truncatedCategory = category.length > 30 ? category.slice(0, 27) + '...' : category;

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '1000px',
        height: '1500px',
        backgroundColor: '#ffffff',
        fontFamily: 'Inter',
        padding: '60px',
        boxSizing: 'border-box',
      },
      children: [
        // Header: brand kiri + kategori kanan
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#292524',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                  },
                  children: 'ALFETO',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#c2410c',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  },
                  children: truncatedCategory,
                },
              },
            ],
          },
        },
        // Divider
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              width: '100%',
              height: '2px',
              backgroundColor: '#292524',
              marginBottom: '40px',
            },
          },
        },
        // Judul besar
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: '62px',
              fontWeight: 700,
              lineHeight: 1.1,
              color: '#292524',
              marginBottom: '40px',
              letterSpacing: '-1px',
            },
            children: truncatedTitle,
          },
        },
        // Divider tipis
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              width: '120px',
              height: '4px',
              backgroundColor: '#c2410c',
              marginBottom: '40px',
            },
          },
        },
        // Foto produk
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '880px',
              height: '640px',
              backgroundColor: '#f5f5f4',
              overflow: 'hidden',
              marginBottom: '40px',
            },
            children: imageDataUrl
              ? {
                  type: 'img',
                  props: {
                    src: imageDataUrl,
                    style: {
                      width: '880px',
                      height: '640px',
                      objectFit: 'cover',
                    },
                  },
                }
              : {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      color: '#a8a29e',
                      fontSize: '22px',
                    },
                    children: 'Foto tidak tersedia',
                  },
                },
          },
        },
        // Spacer
        { type: 'div', props: { style: { display: 'flex', flexGrow: 1 } } },
        // Footer
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '24px',
              borderTop: '2px solid #e7e5e4',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#78716c',
                  },
                  children: 'Inspirasi Interior',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#c2410c',
                  },
                  children: 'Baca di Alfeto.com →',
                },
              },
            ],
          },
        },
      ],
    },
  };
}
