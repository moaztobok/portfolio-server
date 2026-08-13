const API = '';

function $(sel) {
  return document.querySelector(sel);
}

function setStatus(el, message, ok) {
  el.textContent = message;
  el.className = 'status ' + (ok ? 'ok' : 'err');
}

function openModal(id) {
  $(id).classList.add('open');
}

function closeModal(id) {
  $(id).classList.remove('open');
}

document.querySelectorAll('.modal [data-close]').forEach((btn) => {
  btn.addEventListener('click', () => closeModal('#' + btn.closest('.modal').id));
});

document.querySelectorAll('.modal').forEach((modal) => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal('#' + modal.id);
  });
});

function switchTab(name) {
  document.querySelectorAll('.tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.tab === name);
  });
  document.querySelectorAll('.panel').forEach((p) => {
    p.classList.toggle('active', p.id === name);
  });
}

document.querySelectorAll('.tab').forEach((t) => {
  t.addEventListener('click', () => switchTab(t.dataset.tab));
});

async function loadGallery() {
  const grid = $('#gallery-grid');
  grid.innerHTML = '<p class="sub">Loading...</p>';
  try {
    const res = await fetch(API + '/api/gallery/');
    const images = await res.json();
    if (!Array.isArray(images) || images.length === 0) {
      grid.innerHTML = '<p class="sub">No images yet.</p>';
      return;
    }
    grid.innerHTML = '';
    images.forEach((img) => {
      const item = document.createElement('div');
      item.className = 'item';

      const image = document.createElement('img');
      image.src = img.imageUrl;
      image.alt = img.title;

      const meta = document.createElement('div');
      meta.className = 'meta';
      const title = document.createElement('strong');
      title.textContent = img.title;
      const info = document.createElement('span');
      info.textContent = `${img.imageType} · ${img.orientation}`;
      meta.appendChild(title);
      meta.appendChild(info);

      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.addEventListener('click', () => deleteImage(img._id, del));

      const edit = document.createElement('button');
      edit.textContent = 'Edit';
      edit.className = 'edit';
      edit.addEventListener('click', () => openImageModal(img));

      item.appendChild(image);
      item.appendChild(meta);
      item.appendChild(edit);
      item.appendChild(del);
      grid.appendChild(item);
    });
  } catch (e) {
    grid.innerHTML = '<p class="sub">Failed to load images.</p>';
  }
}

async function deleteImage(id, btn) {
  if (!confirm('Delete this image?')) return;
  btn.disabled = true;
  try {
    const res = await fetch(API + `/api/gallery/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadGallery();
    } else {
      alert('Failed to delete');
      btn.disabled = false;
    }
  } catch (e) {
    alert('Failed to delete');
    btn.disabled = false;
  }
}

async function loadBlogs() {
  const list = $('#blog-list');
  list.innerHTML = '<p class="sub">Loading...</p>';
  try {
    const res = await fetch(API + '/api/blog');
    const blogs = await res.json();
    if (!Array.isArray(blogs) || blogs.length === 0) {
      list.innerHTML = '<p class="sub">No posts yet.</p>';
      return;
    }
    list.innerHTML = '';
    blogs.forEach((post) => {
      const el = document.createElement('div');
      el.className = 'post';

      const h = document.createElement('h3');
      h.textContent = post.title;

      const sub = document.createElement('div');
      sub.className = 'sub';
      sub.textContent = `${post.category} · ${post.author} · ${post.lastModified}`;

      const desc = document.createElement('div');
      desc.className = 'desc';
      desc.textContent = post.description;

      el.appendChild(h);
      el.appendChild(sub);
      el.appendChild(desc);

      if (post.images && post.images.length) {
        const thumbs = document.createElement('div');
        thumbs.className = 'thumbs';
        post.images.forEach((img) => {
          const im = document.createElement('img');
          im.src = img.url;
          thumbs.appendChild(im);
        });
        el.appendChild(thumbs);
      }

      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.addEventListener('click', () => deleteBlog(post._id, del));

      const edit = document.createElement('button');
      edit.textContent = 'Edit';
      edit.className = 'edit';
      edit.addEventListener('click', () => openBlogModal(post));

      el.appendChild(edit);
      el.appendChild(del);

      list.appendChild(el);
    });
  } catch (e) {
    list.innerHTML = '<p class="sub">Failed to load posts.</p>';
  }
}

async function deleteBlog(id, btn) {
  if (!confirm('Delete this post?')) return;
  btn.disabled = true;
  try {
    const res = await fetch(API + `/api/blog/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadBlogs();
    } else {
      alert('Failed to delete');
      btn.disabled = false;
    }
  } catch (e) {
    alert('Failed to delete');
    btn.disabled = false;
  }
}

function openImageModal(img) {
  const form = $('#image-edit-form');
  form.id.value = img._id;
  form.title.value = img.title || '';
  form.description.value = img.description || '';
  form.imageType.value = img.imageType || 'artwork';
  openModal('#image-modal');
}

function openBlogModal(post) {
  const form = $('#blog-edit-form');
  form.id.value = post._id;
  form.title.value = post.title || '';
  form.description.value = post.description || '';
  form.author.value = post.author || '';
  form.category.value = post.category || 'Graphic Design';
  form.tags.value = Array.isArray(post.tags) ? post.tags.join(', ') : '';
  form.content.value = post.content || '';
  form.files.value = '';
  renderBlogImagesModal(post);
  openModal('#blog-modal');
}

function renderBlogImagesModal(post) {
  const container = $('#blog-images-existing');
  container.innerHTML = '';
  (post.images || []).forEach((img, index) => {
    const wrap = document.createElement('div');
    wrap.className = 'thumb-edit';

    const im = document.createElement('img');
    im.src = img.url;
    im.alt = 'Image ' + (index + 1);

    const replaceBtn = document.createElement('button');
    replaceBtn.type = 'button';
    replaceBtn.textContent = 'Replace';
    replaceBtn.className = 'edit';
    replaceBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => {
        if (input.files && input.files[0]) {
          replaceBlogImage(post._id, index, input.files[0], im);
        }
      };
      input.click();
    });

    wrap.appendChild(im);
    wrap.appendChild(replaceBtn);
    container.appendChild(wrap);
  });
}

async function replaceBlogImage(blogId, index, file, imgEl) {
  const fd = new FormData();
  fd.append('file', file);
  try {
    const res = await fetch(API + `/api/blog/${blogId}/image/${index}`, { method: 'PUT', body: fd });
    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch (e) {}
    if (res.ok) {
      const updated = data.blog && data.blog.images && data.blog.images[index];
      if (updated) imgEl.src = updated.url;
      loadBlogs();
    } else {
      alert(data.message || data.error || ('Server error: ' + text.slice(0, 300)));
    }
  } catch (err) {
    alert('Network error: ' + err.message);
  }
}

$('#gallery-upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = $('#gallery-upload-status');
  const form = e.target;
  const fd = new FormData();
  fd.append('imageType', form.imageType.value);
  for (const file of form.files.files) {
    fd.append('files', file);
  }
  setStatus(status, 'Uploading...', true);
  try {
    const res = await fetch(API + '/api/gallery/', { method: 'POST', body: fd });
    const data = await res.json();
    if (res.ok) {
      setStatus(status, 'Uploaded successfully', true);
      form.reset();
      loadGallery();
    } else {
      setStatus(status, data.message || data.error || 'Upload failed', false);
    }
  } catch (err) {
    setStatus(status, 'Upload failed', false);
  }
});

$('#blog-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = $('#blog-status');
  const form = e.target;
  const fd = new FormData();
  fd.append('title', form.title.value);
  fd.append('description', form.description.value);
  fd.append('author', form.author.value);
  fd.append('category', form.category.value);
  const tags = form.tags.value.split(',').map((t) => t.trim()).filter(Boolean);
  tags.forEach((t) => fd.append('tags', t));
  fd.append('content', form.content.value);
  for (const file of form.files.files) {
    fd.append('files', file);
  }
  setStatus(status, 'Publishing...', true);
  try {
    const res = await fetch(API + '/api/blog', { method: 'POST', body: fd });
    const data = await res.json();
    if (res.ok) {
      setStatus(status, 'Published successfully', true);
      form.reset();
      loadBlogs();
    } else {
      setStatus(status, data.message || data.error || 'Publish failed', false);
    }
  } catch (err) {
    setStatus(status, 'Publish failed', false);
  }
});

loadGallery();
loadBlogs();

$('#image-edit-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const id = form.id.value;
  const body = {
    title: form.title.value,
    description: form.description.value,
    imageType: form.imageType.value
  };
  try {
    const res = await fetch(API + `/api/gallery/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
      closeModal('#image-modal');
      loadGallery();
    } else {
      alert(data.message || data.error || 'Failed to update image');
    }
  } catch (err) {
    alert('Failed to update image');
  }
});

$('#blog-edit-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const id = form.id.value;
  const fd = new FormData();
  fd.append('title', form.title.value);
  fd.append('description', form.description.value);
  fd.append('author', form.author.value);
  fd.append('category', form.category.value);
  const tags = form.tags.value.split(',').map((t) => t.trim()).filter(Boolean);
  tags.forEach((t) => fd.append('tags', t));
  fd.append('content', form.content.value);
  for (const file of form.files.files) {
    fd.append('files', file);
  }
  try {
    const res = await fetch(API + `/api/blog/${id}`, { method: 'PUT', body: fd });
    const data = await res.json();
    if (res.ok) {
      closeModal('#blog-modal');
      loadBlogs();
    } else {
      alert(data.message || data.error || 'Failed to update post');
    }
  } catch (err) {
    alert('Failed to update post');
  }
});