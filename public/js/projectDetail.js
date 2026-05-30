let currentProject;
let weeklyData = [];

document.addEventListener("DOMContentLoaded", async () => {

  const user = await checkAuth();
  if (!user) return;

  document.getElementById("userInfo").innerText =
    user.role === "admin" ? "Admin" : user.area;

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("id");

  if (!projectId) {
    alert("Project ID tidak ditemukan");
    return;
  }

  await loadProject(projectId);
});

async function loadProject(id) {

  const { data: project } = await sb
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  currentProject = project;

  document.getElementById("projectName").innerText =
    project.nama_proyek;

  document.getElementById("projectInfo").innerText =
    `${project.area} | Progress: ${project.pct_progress}%`;

  const { data } = await sb
    .from("weekly_progress")
    .select("*")
    .eq("project_id", id)
    .order("minggu_ke");

  weeklyData = data || [];

  renderProgressTable();
  renderChart();
}

function renderChart() {

  const totalWeeks = 20; // sementara default
  const target = generateSCurve(totalWeeks);

  const realisasi = new Array(totalWeeks + 1).fill(null);

  weeklyData.forEach(w => {
    realisasi[w.minggu_ke] = w.pct_realisasi;
  });

  new Chart(document.getElementById("kurvaChart"), {
    type: "line",
    data: {
      labels: target.map((_, i) => `M-${i}`),
      datasets: [
        {
          label: "Target",
          data: target,
          borderColor: "#1F3A5F",
          fill: false
        },
        {
          label: "Realisasi",
          data: realisasi,
          borderColor: "#1E8E3E",
          fill: false
        }
      ]
    }
  });
}

function renderProgressTable() {

  if (weeklyData.length === 0) {
    document.getElementById("progressTable").innerHTML =
      "<p>Belum ada data</p>";
    return;
  }

  document.getElementById("progressTable").innerHTML = `
    <table style="width:100%;">
      <thead>
        <tr>
          <th>Minggu</th>
          <th>Progress</th>
        </tr>
      </thead>
      <tbody>
        ${weeklyData.map(w => `
          <tr>
            <td>${w.minggu_ke}</td>
            <td>${w.pct_realisasi}%</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

async function saveProgress() {

  const val = parseFloat(
    document.getElementById("progressInput").value
  );

  if (isNaN(val) || val < 0 || val > 100) {
    alert("Input tidak valid");
    return;
  }

  const mingguKe = weeklyData.length + 1;

  await sb.from("weekly_progress").insert({
    project_id: currentProject.id,
    minggu_ke: mingguKe,
    tanggal_minggu: new Date().toISOString(),
    pct_realisasi: val
  });

  alert("Berhasil disimpan");
  location.reload();
}

async function exportPDF() {

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.text(currentProject.nama_proyek, 10, 10);
  pdf.text(`Area: ${currentProject.area}`, 10, 20);
  pdf.text(`Progress: ${currentProject.pct_progress}%`, 10, 30);

  pdf.save("laporan-proyek.pdf");
}
