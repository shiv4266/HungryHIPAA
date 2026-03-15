import { useEffect, useState } from "react";
import {
  buildReport,
  deidentifyCsvText,
  deidentifyJsonText,
  deidentifyText,
} from "./deidentify";

export default function App() {
  const [summary, setSummary] = useState({
    totalPatients: 1163,
    totalEncounters: 61459,
    totalConditions: 38094,
    avgEncounterCost: 4149.66,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [reportUrl, setReportUrl] = useState("");
  const [statusMessage, setStatusMessage] = useState("No file selected.");

  useEffect(() => {
    fetch("/dashboard_summary.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load dashboard_summary.json");
        }
        return response.json();
      })
      .then((data) => {
        setSummary({
          totalPatients: Number(data.total_patients) || 0,
          totalEncounters: Number(data.total_encounters) || 0,
          totalConditions: Number(data.total_conditions) || 0,
          avgEncounterCost: Number(data.average_encounter_cost) || 0,
        });
      })
      .catch((error) => {
        console.error("Dashboard summary load error:", error);
      });
  }, []);

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      if (reportUrl) URL.revokeObjectURL(reportUrl);
    };
  }, [downloadUrl, reportUrl]);

  const handleFileChange = (event) => {
    const file =
      event.target.files && event.target.files[0]
        ? event.target.files[0]
        : null;

    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    if (reportUrl) URL.revokeObjectURL(reportUrl);

    setSelectedFile(file);
    setDownloadUrl("");
    setReportUrl("");

    if (file) {
      setStatusMessage("File selected and ready to process.");
    } else {
      setStatusMessage("No file selected.");
    }
  };

  const getFileExtension = (name) => {
    const dotIndex = name.lastIndexOf(".");
    return dotIndex >= 0 ? name.slice(dotIndex).toLowerCase() : "";
  };

  const handleProcessFile = async () => {
    if (!selectedFile) {
      setStatusMessage("Please choose a file first.");
      alert("Please choose a file first.");
      return;
    }

    try {
      setStatusMessage("Processing file...");

      const text = await selectedFile.text();
      const extension = getFileExtension(selectedFile.name);

      let result;

      if (extension === ".json") {
        result = deidentifyJsonText(text);
      } else if (extension === ".csv") {
        result = deidentifyCsvText(text);
      } else {
        result = deidentifyText(text);
      }

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      if (reportUrl) URL.revokeObjectURL(reportUrl);

      const processedBlob = new Blob([result.text], {
        type: selectedFile.type || "text/plain",
      });
      const processedUrl = URL.createObjectURL(processedBlob);

      const reportText = buildReport(selectedFile.name, result.findings);
      const reportBlob = new Blob([reportText], { type: "text/plain" });
      const newReportUrl = URL.createObjectURL(reportBlob);

      setDownloadUrl(processedUrl);
      setReportUrl(newReportUrl);
      setStatusMessage("Processing complete. Files ready for download.");
    } catch (error) {
      console.error("File processing error:", error);
      setStatusMessage("There was a problem processing the file.");
      alert("There was a problem processing the file.");
    }
  };

  const metrics = [
    { label: "Patients", value: summary.totalPatients.toLocaleString() },
    { label: "Encounters", value: summary.totalEncounters.toLocaleString() },
    { label: "Conditions", value: summary.totalConditions.toLocaleString() },
    {
      label: "Avg Encounter Cost",
      value: `$${summary.avgEncounterCost.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    },
  ];

  const navItems = ["Dashboard", "Analytics", "Pipeline", "Privacy"];

  return (
    <div className="app min-h-screen">
      <nav className="app-nav border-b">
        <div className="app-container flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/joyce.png"
              alt="HungryHIPAA logo"
              className="app-logo h-60 w-60 object-contain"
            />
            <div className="flex flex-col leading-tight">
              <h1 className="app-brand text-4xl font-bold">HungryHIPAA</h1>
              <p className="app-brand-subtitle text-m">
                Ingest PHI. Deidentify fast. Download safely.
              </p>
            </div>
          </div>

          <div className="flex gap-6 text-sm">
            {navItems.map((item) => (
              <a key={item} href="#" className="app-link">
                {item}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <header className="app-header border-b">
        <div className="app-container px-6 py-6">
          <h2 className="app-heading text-2xl font-semibold">
            Healthcare Analytics Dashboard
          </h2>
          <p className="app-subtext mt-1 text-sm">
            Synthetic healthcare data processed through the HungryHIPAA pipeline
          </p>
        </div>
      </header>

      <main className="app-container px-6 py-8">
        <section className="mb-8">
          <article className="app-card rounded-3xl border p-6">
            <h3 className="app-section-title mb-2 text-xl font-semibold">
              Prototype File Deidentification
            </h3>
            <p className="app-subtext text-sm">
              Upload a text-based file to run a Safe Harbor–oriented prototype
              redaction pass and download both the processed file and a
              deidentification report.
            </p>

            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center">
              <input
                type="file"
                accept=".txt,.csv,.json"
                onChange={handleFileChange}
                className="app-file-input block w-full text-sm"
              />

              <button
                type="button"
                onClick={handleProcessFile}
                className="app-upload-button rounded-2xl px-5 py-3 font-semibold"
              >
                Process File
              </button>
            </div>

            <p className="app-status mt-4 text-sm">{statusMessage}</p>

            {selectedFile && (
              <p className="app-subtext mt-2 text-sm">
                Selected file:{" "}
                <span className="app-file-name">{selectedFile.name}</span>
              </p>
            )}

            {(downloadUrl || reportUrl) && (
              <div className="mt-6 flex flex-wrap gap-3">
                {downloadUrl && selectedFile && (
                  <a
                    href={downloadUrl}
                    download={`processed_${selectedFile.name}`}
                    className="app-download-button inline-flex w-fit items-center rounded-2xl px-5 py-3 font-semibold"
                  >
                    Download Processed File
                  </a>
                )}

                {reportUrl && selectedFile && (
                  <a
                    href={reportUrl}
                    download={`report_${selectedFile.name}.txt`}
                    className="app-download-button inline-flex w-fit items-center rounded-2xl px-5 py-3 font-semibold"
                  >
                    Download Report
                  </a>
                )}
              </div>
            )}
          </article>
        </section>

        <section className="mb-4">
          <h3 className="app-section-title text-xl font-semibold">
            Summary Metrics
          </h3>
          <p className="app-subtext mt-1 text-sm">
            Key statistics from the built-in synthetic healthcare dataset.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="app-card rounded-3xl border p-6"
            >
              <p className="app-metric-label text-sm font-medium">
                {metric.label}
              </p>
              <p className="app-metric-value mt-2 text-3xl font-bold">
                {metric.value}
              </p>
            </article>
          ))}
        </section>

        <section className="mb-4 mt-8">
          <h3 className="app-section-title text-xl font-semibold">
            Visual Analytics
          </h3>
          <p className="app-subtext mt-1 text-sm">
            Charts showing condition trends and encounter distribution from the
            synthetic dataset.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="app-card rounded-3xl border p-5">
            <h3 className="app-section-title mb-4 text-xl font-semibold">
              Top Conditions
            </h3>
            <img
              src="/top_conditions_chart.png"
              alt="Top conditions chart"
              className="app-chart w-full rounded-2xl border"
            />
          </article>

          <article className="app-card rounded-3xl border p-5">
            <h3 className="app-section-title mb-4 text-xl font-semibold">
              Encounter Types
            </h3>
            <img
              src="/encounter_types_chart.png"
              alt="Encounter types chart"
              className="app-chart w-full rounded-2xl border"
            />
          </article>
        </section>
      </main>
    </div>
  );
}
