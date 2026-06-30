// products/products.js
// Centralized product loading and rendering for shop and product details pages.

(function () {
  'use strict';

  var PRODUCTS_JSON_PATH = 'products/products.json';

  function fetchProducts() {
    return fetch(PRODUCTS_JSON_PATH, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).then(function (response) {
      if (!response.ok) {
        throw new Error('Failed to load products.json');
      }
      return response.json();
    });
  }

  function getQueryParam(name) {
    var search = window.location.search.substring(1);
    var vars = search.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) === name) {
        return typeof pair[1] === 'undefined' ? '' : decodeURIComponent(pair[1]);
      }
    }
    return null;
  }

  function formatPrice(value) {
    var num = Number(value);
    if (isNaN(num)) {
      return '';
    }
    return '$' + num.toFixed(2);
  }

  function getProductImages(product) {
    var images = [];

    if (product.mainImage) {
      images.push(product.mainImage);
    }

    if (product.gallery && product.gallery.length) {
      product.gallery.forEach(function (src) {
        if (src && images.indexOf(src) === -1) {
          images.push(src);
        }
      });
    }

    return images;
  }

  function renderShopPage(products) {
    var list = document.querySelector('.wrap_shop_list ul.shop_list');
    if (!list) {
      return;
    }

    list.innerHTML = '';

    products.forEach(function (product) {
      var li = document.createElement('li');

      var productUrl = 'shop_product_page.html?id=' + encodeURIComponent(product.id);

      var a = document.createElement('a');
      a.href = productUrl;

      var hoverDiv = document.createElement('div');
      hoverDiv.className = 'hover_img';

      var img = document.createElement('img');
      img.src = product.mainImage;
      img.alt = '';
      hoverDiv.appendChild(img);

      var title = document.createElement('h3');
      title.textContent = product.title;

      a.appendChild(hoverDiv);
      a.appendChild(title);

      var meta = document.createElement('div');
      meta.className = 'product_meta';

      var category = document.createElement('div');
      category.className = 'product_category';
      category.innerHTML = 'Category: <a href="javascript:void(0);">Ornaments</a>.';

      var price = document.createElement('div');
      price.className = 'product_price';

      var amountSpan = document.createElement('span');
      amountSpan.className = 'amount';
      amountSpan.textContent = formatPrice(product.price);
      price.appendChild(amountSpan);

      var addToCart = document.createElement('a');
      addToCart.className = 'button add_to_cart_button';
      addToCart.href = productUrl;
      addToCart.textContent = 'Add to cart';

      meta.appendChild(category);
      meta.appendChild(price);
      meta.appendChild(addToCart);

      li.appendChild(a);
      li.appendChild(meta);

      list.appendChild(li);
    });
  }

  function bindThumbnailClicks() {
    // Detach legacy jQuery handler, if present, so we can fully control the behavior.
    if (window.jQuery && jQuery('.product_thumbs li a').length) {
      jQuery('.product_thumbs li a').off('click');
    }

    var thumbs = document.querySelectorAll('.product_thumbs li a');
    var largeImage = document.getElementById('largeImage');
    var zoomLink = document.getElementById('zoom_product');

    if (!thumbs.length || !largeImage || !zoomLink) {
      return;
    }

    Array.prototype.forEach.call(thumbs, function (thumb) {
      thumb.addEventListener('click', function (e) {
        e.preventDefault();

        Array.prototype.forEach.call(thumbs, function (t) {
          t.classList.remove('current');
        });
        thumb.classList.add('current');

        var img = thumb.querySelector('img');
        if (img && img.src) {
          largeImage.src = img.src;
          zoomLink.href = img.src;
        }
      });
    });
  }

  function bindColorSelection() {
    var colorLinks = document.querySelectorAll('.product_colors .shortcode_button');
    if (!colorLinks.length) {
      return;
    }

    Array.prototype.forEach.call(colorLinks, function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();

        Array.prototype.forEach.call(colorLinks, function (item) {
          item.classList.remove('btn_type1');
          item.classList.add('btn_type2');
        });

        link.classList.remove('btn_type2');
        link.classList.add('btn_type1');
      });
    });
  }

  function renderProductDetailsPage(products) {
    var idParam = getQueryParam('id');
    var id = idParam !== null ? parseInt(idParam, 10) : NaN;

    var product = products.find(function (p) { return p.id === id; });
    if (!product && products.length) {
      product = products[0];
    }
    if (!product) {
      return;
    }

    var titleEl = document.querySelector('.summary .product_title');
    if (titleEl) {
      titleEl.textContent = product.title;
    }

    var amountEl = document.querySelector('.summary .amount');
    if (amountEl) {
      amountEl.innerHTML = '';
      if (typeof product.oldPrice === 'number' && product.oldPrice > product.price) {
        var del = document.createElement('del');
        del.textContent = formatPrice(product.oldPrice);
        amountEl.appendChild(del);
      }
      var span = document.createElement('span');
      span.textContent = ' ' + formatPrice(product.price);
      amountEl.appendChild(span);
    }

    var descEl = document.querySelector('.summary > p');
    if (descEl) {
      descEl.textContent = product.description;
    }

    var largeImage = document.getElementById('largeImage');
    var zoomLink = document.getElementById('zoom_product');
    if (largeImage) {
      largeImage.src = product.mainImage;
    }
    if (zoomLink) {
      zoomLink.href = product.mainImage;
    }

    var productImages = getProductImages(product);
    var thumbsList = document.querySelector('.product_thumbs ul');
    if (thumbsList && productImages.length) {
      thumbsList.innerHTML = '';

      productImages.forEach(function (src, index) {
        var li = document.createElement('li');

        var a = document.createElement('a');
        a.href = 'javascript:void(0)';
        if (index === 0) {
          a.className = 'current';
        }

        var wrap = document.createElement('div');
        wrap.className = 'woo_hover_img';

        var img = document.createElement('img');
        img.src = src;
        img.alt = '';

        wrap.appendChild(img);
        a.appendChild(wrap);
        li.appendChild(a);
        thumbsList.appendChild(li);
      });
    }

    var summary = document.querySelector('.summary');
    if (summary && product.colors && product.colors.length) {
      var existing = summary.querySelector('.product_colors');
      if (existing) {
        existing.parentNode.removeChild(existing);
      }

      var colorsDiv = document.createElement('div');
      colorsDiv.className = 'product_colors';

      var label = document.createElement('div');
      label.className = 'product_color_label';
      label.textContent = 'Colors:';
      colorsDiv.appendChild(label);

      product.colors.forEach(function (color, index) {
        var colorLink = document.createElement('a');
        colorLink.href = 'javascript:void(0);';
        colorLink.className = 'shortcode_button btn_small ' + (index === 0 ? 'btn_type1' : 'btn_type2');
        colorLink.textContent = color;
        colorsDiv.appendChild(colorLink);
      });

      var amountNode = document.querySelector('.summary .amount');
      if (amountNode && amountNode.parentNode === summary) {
        summary.insertBefore(colorsDiv, amountNode.nextSibling);
      } else {
        summary.appendChild(colorsDiv);
      }
    }

    bindThumbnailClicks();
    bindColorSelection();
  }

  function init() {
    var path = window.location.pathname.split('/').pop();

    if (path !== 'shop.html' && path !== 'shop_product_page.html') {
      return;
    }

    fetchProducts()
      .then(function (products) {
        if (path === 'shop.html') {
          renderShopPage(products);
        } else if (path === 'shop_product_page.html') {
          renderProductDetailsPage(products);
        }
      })
      .catch(function (error) {
        if (window.console && console.error) {
          console.error(error);
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

