document.addEventListener("DOMContentLoaded", async () => {

  const user = await checkAuth();
  if (!user) return;

  document.getElementById("userInfo").innerText =
    user.role === "admin"
      ? "Admin"
      : user.area;

  await loadWilayahOptions(user);
  await loadDashboard(user);

});

async function loadWilayahOptions(user) {

  const select = document.getElementById("filterWilayah");

  if (user.role === "admin") {

    const { data } = await sb
      .from("projects")
      .select("wilayah");

    const wilayahList = [...new Set(data.map(p => p.wilayah))];

    select.innerHTML =
      `<option value="ALL">Semua Wilayah</option>` +
      wilayahList.map(w =>
        `<option value="${w}">${w}</option>`
      ).join("");

  } else {
    select.innerHTML =
      `<option value="${user.wilayah}">${user.wilayah}</option>`;
  }

  select.addEventListener("change", () => loadDashboard(user));
}

async function loadDashboard(user) {

  const selectedWilayah =
    document.getElementById("filterWilayah").value;

  let query = sb
    .from("projects")
    .select("id,nama_proyek,wilayah,area,pct_progress,delay,status")
    .eq("status", "PROGRESS");

  if (user.role === "admin") {
    if (selectedWilayah !== "ALL") {
      query = query.eq("wilayah", selectedWilayah);
    }
  } else {
    query = query.eq("area", user.area);
  }

  const { data: projects } = await query;

  renderStats(projects);
  renderTable(projects);
  renderChart(projects);
}

function renderStats(projects) {

  const total = projects.length;
  const avg =
    total > 0
      ? (projects.reduce((s, p) => s + p.pct_progress, 0) / total).toFixed(2)
      : 0;

  const delay =
    projects.filter(p => p.delay > 0).length;

  document.getElementById("stats").innerHTML = `
    <p>Total Proyek: <strong>${total}</strong></p>
    <p>Rata-rata Progress: <strong>${avg}%</strong></p>
    <p>Total Terlambat: <strong>${delay}</strong></p>
  `;
}

function renderTable(projects) {

  if (projects.length === 0) {
    document.getElementById("projectTable").innerHTML =
      "<p>Tidak ada proyek</p>";
    return;
  }

  document.getElementById("projectTable").innerHTML = `
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th>Nama</th>
          <th>Area</th>
          <th>Progress</th>
          <th>Delay</th>
        </tr>
      </thead>
      <tbody>
        ${projects.map(p => `
          <tr>
            <td>${p.nama_proyek}</td>
            <td>${p.area}</td>
            <td>${p.pct_progress}%</td>
            <td>${p.delay || 0}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderChart(projects) {

  const grouped = {};

  projects.forEach(p => {
    if (!grouped[p.wilayah]) grouped[p.wilayah] = [];
    grouped[p.wilayah].push(p.pct_progress);
  });

  const labels = Object.keys(grouped);
  const values = labels.map(w =>
    grouped[w].reduce((a,b)=>a+b,0) / grouped[w].length
  );

  new Chart(document.getElementById("chartWilayah"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Avg Progress %",
        data: values,
        backgroundColor: "#1F3A5F"
      }]
    }
  });
}
