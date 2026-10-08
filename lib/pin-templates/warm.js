// Template Pin "Warm" — 1000 x 1500 px
// Warm minimalis organik: krem, beige, cokelat kayu, hijau sage (muted).
// Whitespace luas di atas, judul uppercase tegas, pita cokelat hangat di bawah.

export function renderWarm({ title, imageDataUrl, category }) {
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
        backgroundColor: '#f3ece2',
        fontFamily: 'Inter',
        padding: '0',
        boxSizing: 'border-box',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: '90px',
              paddingLeft: '80px',
              paddingRight: '80px',
              boxSizing: 'border-box',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 34px',
                    backgroundColor: '#e8dccb',
                    color: '#6b5138',
                    fontSize: '22px',
                    fontWeight: 600,
                    borderRadius: '999px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    border: '2px solid #c9b79c',
                  },
                  children: truncatedCategory,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: '64px',
                    fontWeight: 700,
                    lineHeight: 1.15,
                    letterSpacing: '1px',
                    color: '#5a4030',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    marginTop: '50px',
                    padding: '0 20px',
                  },
                  children: truncatedTitle,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    width: '80px',
                    height: '3px',
                    backgroundColor: '#c9b79c',
                    marginTop: '44px',
                    borderRadius: '999px',
                  },
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: '28px',
                    fontWeight: 400,
                    lineHeight: 1.45,
                    color: '#8a7660',
                    textAlign: 'center',
                    marginTop: '36px',
                    padding: '0 60px',
                  },
                  children: 'Hemat tempat di meja, tampil lebih rapi & estetik setiap hari.',
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexGrow: 1,
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingTop: '50px',
              paddingLeft: '90px',
              paddingRight: '90px',
              boxSizing: 'border-box',
            },
            children: imageDataUrl
              ? {
                  type: 'img',
                  props: {
                    src: imageDataUrl,
                    style: {
                      width: '820px',
                      height: '760px',
                      objectFit: 'cover',
                      borderRadius: '24px',
                      boxShadow: '0 20px 60px rgba(90, 64, 48, 0.15)',
                    },
                  },
                }
              : {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '820px',
                      height: '760px',
                      backgroundColor: '#e8dccb',
                      borderRadius: '24px',
                      color: '#a8977e',
                      fontSize: '24px',
                    },
                    children: 'Foto tidak tersedia',
                  },
                },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#7a5a3e',
              height: '130px',
              width: '1000px',
              paddingLeft: '80px',
              paddingRight: '80px',
              boxSizing: 'border-box',
              marginTop: '60px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: '30px',
                    color: '#e8dccb',
                    marginRight: '20px',
                  },
                  children: '✦',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#f3ece2',
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
