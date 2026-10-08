// Template Pin "Minimalis" — 1000 x 1500 px
// Cream background, foto rounded, judul bold, CTA bawah.

export function renderMinimalis({ title, imageDataUrl, category }) {
  const truncatedTitle = title.length > 90 ? title.slice(0, 87) + '...' : title;
  const truncatedCategory = category.length > 30 ? category.slice(0, 27) + '...' : category;

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '1000px',
        height: '1500px',
        backgroundColor: '#fafaf9',
        fontFamily: 'Inter',
        padding: '60px',
        boxSizing: 'border-box',
      },
      children: [
        // Header: Badge kategori
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    padding: '12px 28px',
                    backgroundColor: '#c2410c',
                    color: '#ffffff',
                    fontSize: '22px',
                    fontWeight: 600,
                    borderRadius: '999px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  },
                  children: truncatedCategory,
                },
              },
            ],
          },
        },
        // Foto produk (frame rounded + subtle shadow)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '880px',
              height: '700px',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              marginBottom: '50px',
            },
            children: imageDataUrl
              ? {
                  type: 'img',
                  props: {
                    src: imageDataUrl,
                    style: {
                      width: '880px',
                      height: '700px',
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
        // Judul besar
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: '54px',
              fontWeight: 700,
              lineHeight: 1.15,
              color: '#292524',
              textAlign: 'center',
              marginBottom: '40px',
              padding: '0 20px',
            },
            children: truncatedTitle,
          },
        },
        // Spacer
        { type: 'div', props: { style: { display: 'flex', flexGrow: 1 } } },
        // CTA bawah
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '30px',
              borderTop: '2px solid #e7e5e4',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: '26px',
                    fontWeight: 600,
                    color: '#c2410c',
                    marginBottom: '8px',
                  },
                  children: 'Baca selengkapnya di',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#292524',
                    letterSpacing: '1px',
                  },
                  children: 'Alfeto.com',
                },
              },
            ],
          },
        },
      ],
    },
  };
}
