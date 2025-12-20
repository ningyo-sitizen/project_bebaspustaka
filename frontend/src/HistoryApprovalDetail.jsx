import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function HistoryApprovalDetail() {
  const { batch_id } = useParams();
  const [data, setData] = useState([]);
  const [checked, setChecked] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `http://localhost:8080/api/history/batch/${batch_id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setData(res.data.data);
        setChecked(new Array(res.data.data.length).fill(false));
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchBatch();
  }, [batch_id]);

  const handleCheckAll = (e) => {
    setChecked(new Array(data.length).fill(e.target.checked));
  };

  const handleCheckOne = (index) => {
    const updated = [...checked];
    updated[index] = !updated[index];
    setChecked(updated);
  };

  const handleExportPDF = () => {
    const token = localStorage.getItem("token");
    window.open(
      `http://localhost:8080/api/history/batch/${batch_id}/export-pdf?token=${token}`,
      "_blank"
    );
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">
          History Approval – Batch {batch_id}
        </h2>

        <button
          onClick={handleExportPDF}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Export PDF
        </button>
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">
              <input type="checkbox" onChange={handleCheckAll} />
            </th>
            <th>NIM</th>
            <th>Nama</th>
            <th>Prodi</th>
            <th>Status</th>
            <th>Waktu</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id} className="border-t">
              <td className="text-center">
                <input
                  type="checkbox"
                  checked={checked[i]}
                  onChange={() => handleCheckOne(i)}
                />
              </td>
              <td>{row.nim}</td>
              <td>{row.nama_mahasiswa}</td>
              <td>{row.program_studi}</td>
              <td>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                  {row.STATUS_bebas_pustaka}
                </span>
              </td>
              <td>{row.waktu_bebaspustaka}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
