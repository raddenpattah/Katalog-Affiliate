// Template Pin "Bold" — 1000 x 1500 px
// Color block terracotta di atas & bawah, foto full-width, judul besar.

export function renderBold({ title, imageDataUrl, category }) {
  const truncatedTitle = title.length > 80 ? title.slice(0, 77) + '...' : title;
  const truncatedCategory = category.length > 25 ? category.slice(0, 22) + '...' : category;

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '1000px',
        height: '1500px',
        backgroundColor: '#fef3c7', // cream warm
        fontFamily: 'Inter',
        boxSizing: 'border-box',
      },
      children: [
        // Header color block (terracotta)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '1000px',
              height: '180px',
              backgroundColor: '#c2410c',
              color: '#ffffff',
              fontSize: '32px',
              fontWeight: 700,
              letterSpacing: '4px',
              textTransform: 'uppercase',
            },
            children: truncatedCategory,
          },
        },
        // Foto produk (full width, square-ish)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '1000px',
              height: '750px',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
            },
            children: imageDataUrl
              ? {
                  type: 'img',
                  props: {
                    src: imageDataUrl,
                    style: {
                      width: '1000px',
                      height: '750px',
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
                      fontSize: '24px',
                    },
                    children: 'Foto tidak tersedia',
                  },
                },
          },
        },
        // Color block bawah dengan judul
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '1000px',
              flexGrow: 1,
              backgroundColor: '#292524',
              padding: '50px 60px',
              boxSizing: 'border-box',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: '48px',
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: '#ffffff',
                    textAlign: 'center',
                    marginBottom: '40px',
                  },
                  children: truncatedTitle,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: '22px',
                    fontWeight: 600,
                    color: '#fbbf24',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
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
