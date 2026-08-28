const Http = {
  async request(method, endpoint, body = null, auth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && State.getToken()) headers['Authorization'] = `Bearer ${State.getToken()}`;

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    const res = await fetch(`${API}${endpoint}`, config);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },

  get:    (ep, auth = false)      => Http.request('GET',    ep, null, auth),
  post:   (ep, body, auth = false) => Http.request('POST',   ep, body, auth),
  patch:  (ep, body, auth = false) => Http.request('PATCH',  ep, body, auth),
};
