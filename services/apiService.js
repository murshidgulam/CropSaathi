
const API_BASE_URL = 'http://127.0.0.1:3000';

// SAVE A SCAN TO BACKEND
export async function saveScanToBackend(scan) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        crop: scan.crop,
        disease: scan.disease,
        predictedClass: scan.predictedClass,
        confidence: scan.confidence,
        date: new Date().toISOString(),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Could not save scan.');
    }

    console.log('Scan saved to backend:', result.scanId);

    return result.scanId;

  } catch (error) {
    console.error('Backend scan saving failed:', error.message);
    return null;
  }
}

// DELETE ONE SCAN FROM SQLITE
export async function deleteScanFromBackend(scanId) {
  const response = await fetch(
    `${API_BASE_URL}/api/scans/${scanId}`,
    {
      method: 'DELETE',
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Could not delete scan.');
  }

  return result.success;
}

// DELETE ALL SCANS FROM SQLITE
export async function clearAllScansFromBackend() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scans`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    const responseText = await response.text();

    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Backend returned invalid response. Status: ${response.status}. Response: ${responseText.slice(0, 200)}`
      );
    }

    if (!response.ok) {
      throw new Error(
        result.message || 'Could not clear scan history.'
      );
    }

    console.log('Deleted SQLite records:', result.deletedCount);

    return result;
  } catch (error) {
    console.error('Clear history API error:', error);
    throw error;
  }
}
