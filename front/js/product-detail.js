document.addEventListener('DOMContentLoaded', async function () {
  const detailGrid = document.getElementById('detailGrid');
  const notFoundMsg = document.getElementById('notFoundMsg');
  if (!detailGrid) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  let product = null;
  try {
    product = id ? await getProductById(id) : null;
  } catch (err) {
    product = null;
  }

  if (!product) {
    detailGrid.style.display = 'none';
    notFoundMsg.style.display = 'block';
    return;
  }

  document.title = `${product.name} — Ballet Enterprise`;

  const galleryMain = document.getElementById('galleryMain');
  const galleryThumbs = document.getElementById('galleryThumbs');
  const images = product.images && product.images.length ? product.images : [];

  function setMainImage(url) {
    galleryMain.style.backgroundImage = `url('${url}')`;
  }

  if (images.length) {
    setMainImage(images[0]);
    galleryThumbs.innerHTML = images.map(function (img, index) {
      return `<button class="thumb-btn ${index === 0 ? 'active' : ''}" style="background-image:url('${img}')" data-src="${img}" aria-label="View image ${index + 1}"></button>`;
    }).join('');

    galleryThumbs.querySelectorAll('.thumb-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        galleryThumbs.querySelectorAll('.thumb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setMainImage(btn.dataset.src);
      });
    });
  }

  // Video — optional, shown only if the admin added one
  const videoBlock = document.getElementById('detailVideoBlock');
  const videoWrap = document.getElementById('detailVideoWrap');

  if (product.video) {
    videoWrap.innerHTML = `
      <video controls preload="metadata" playsinline>
        <source src="${product.video}" type="video/mp4">
        Your browser doesn't support embedded video.
      </video>
    `;
  } else {
    videoBlock.style.display = 'none';
  }

  // Info panel
  document.getElementById('detailCategory').textContent = product.category;
  document.getElementById('detailName').textContent = product.name;
  document.getElementById('detailPrice').textContent = await formatPrice(product.price);
  document.getElementById('detailDescription').textContent = product.description || '';

  const badgesEl = document.getElementById('detailBadges');
  let badgesHTML = '';
  const isPreorder = product.availability === 'preorder';

  badgesHTML += isPreorder
    ? '<span class="availability-pill preorder">Pre-Order</span>'
    : '<span class="availability-pill ghana">Available in Ghana</span>';

  if (product.tag) {
    badgesHTML += `<span class="tag-pill">${product.tag}</span>`;
  }
  badgesEl.innerHTML = badgesHTML;

  const shipNoteEl = document.getElementById('detailShipNote');
  if (isPreorder && product.shipTime) {
    shipNoteEl.textContent = `Ships in ${product.shipTime}`;
  } else {
    shipNoteEl.style.display = 'none';
  }

  const buyBtn = document.getElementById('detailBuyBtn');
  if (isPreorder) {
    buyBtn.textContent = 'Pre-Order Now';
    buyBtn.classList.add('preorder-buy');
  } else {
    buyBtn.textContent = 'Add to Cart';
  }

  buyBtn.addEventListener('click', function () {
    addToCart(product.id, 1, product.name);
    const originalText = buyBtn.textContent;
    buyBtn.textContent = 'Added to Cart ✓';
    buyBtn.disabled = true;
    setTimeout(function () {
      buyBtn.textContent = originalText;
      buyBtn.disabled = false;
    }, 1200);
  });

  // ===== Reviews & Ratings =====
  const reviewsListEl = document.getElementById('reviewsList');
  const noReviewsEl = document.getElementById('noReviews');
  const averageNumberEl = document.getElementById('averageNumber');
  const averageStarsEl = document.getElementById('averageStars');
  const averageCountEl = document.getElementById('averageCount');

  function formatReviewDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  async function renderReviews() {
    let reviews = [];
    let average = 0;
    let count = 0;

    try {
      reviews = await getReviewsForProduct(product.id);
      const summary = await getAverageRating(product.id);
      average = summary.average;
      count = summary.count;
    } catch (err) {
      // leave defaults (0 reviews) if the request fails
    }

    averageNumberEl.textContent = average.toFixed(1);
    averageStarsEl.textContent = buildStarString(average);
    averageCountEl.textContent = count === 0
      ? 'No reviews yet'
      : `Based on ${count} review${count === 1 ? '' : 's'}`;

    if (reviews.length === 0) {
      reviewsListEl.innerHTML = '';
      noReviewsEl.style.display = 'block';
      return;
    }

    noReviewsEl.style.display = 'none';
    reviewsListEl.innerHTML = reviews.map(function (r) {
      const initial = r.author.trim().charAt(0).toUpperCase();
      return `
        <div class="review-card">
          <div class="review-avatar">${initial}</div>
          <div class="review-body">
            <div class="review-top">
              <span class="review-author">${r.author}</span>
              <span class="review-date">${formatReviewDate(r.createdAt)}</span>
            </div>
            <span class="review-stars">${buildStarString(r.rating)}</span>
            <p class="review-comment">${r.comment}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  await renderReviews();

  // Star picker for the write-a-review form
  const starButtons = document.querySelectorAll('.star-pick');
  let selectedRating = 0;

  function paintStars(rating) {
    starButtons.forEach(function (btn) {
      btn.classList.toggle('selected', Number(btn.dataset.value) <= rating);
    });
  }

  starButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      selectedRating = Number(btn.dataset.value);
      paintStars(selectedRating);
    });
    btn.addEventListener('mouseenter', function () {
      paintStars(Number(btn.dataset.value));
    });
  });

  const starPickerEl = document.getElementById('starPicker');
  if (starPickerEl) {
    starPickerEl.addEventListener('mouseleave', function () {
      paintStars(selectedRating);
    });
  }

  const reviewForm = document.getElementById('reviewForm');
  const reviewError = document.getElementById('reviewError');

  reviewForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    reviewError.textContent = '';
    reviewError.style.color = '#d64545';

    const nameInput = document.getElementById('reviewName');
    const commentInput = document.getElementById('reviewComment');

    if (!nameInput.value.trim()) {
      reviewError.textContent = 'Please enter your name.';
      return;
    }
    if (selectedRating === 0) {
      reviewError.textContent = 'Please select a star rating.';
      return;
    }
    if (!commentInput.value.trim()) {
      reviewError.textContent = 'Please write a short review.';
      return;
    }

    const submitBtn = reviewForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
      await addReview(product.id, {
        author: nameInput.value.trim(),
        rating: selectedRating,
        comment: commentInput.value.trim()
      });

      reviewForm.reset();
      selectedRating = 0;
      paintStars(0);
      await renderReviews();
    } catch (err) {
      reviewError.textContent = err.message || 'Could not submit your review.';
    } finally {
      submitBtn.disabled = false;
    }
  });
});