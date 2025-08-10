import type { RequestHandler } from './$types';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export const GET: RequestHandler = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json(); // Get JSON response
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to fetch info from API:', error);
    return new Response(
      `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>System Info - Error - pingiMAP</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
          --error-500: #ef4444;
          --error-100: #fee2e2;
          --error-700: #b91c1c;
          --gray-50: #f9fafb;
          --gray-700: #374151;
          --gray-900: #111827;
          --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --radius-lg: 0.75rem;
          --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
          --space-6: 1.5rem;
          --space-8: 2rem;
          --container-max-width: 1200px;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
          font-family: var(--font-family);
          line-height: 1.5;
          color: var(--gray-900);
          background-color: var(--gray-50);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .container {
          max-width: var(--container-max-width);
          margin: 0 auto;
          padding: var(--space-8) var(--space-6);
        }
        
        .error-card {
          background: white;
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          box-shadow: var(--shadow-base);
          border: 1px solid var(--error-100);
          text-align: center;
          max-width: 500px;
        }
        
        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .error-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--error-700);
          margin-bottom: 1rem;
        }
        
        .error-message {
          color: var(--gray-700);
          margin-bottom: 1.5rem;
          padding: 1rem;
          background-color: var(--error-100);
          border-radius: var(--radius-lg);
          border-left: 4px solid var(--error-500);
        }
        
        .error-details {
          font-family: monospace;
          font-size: 0.875rem;
          color: var(--gray-700);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="error-card">
            <h1 class="error-title">System Info - Error</h1>
            <div class="error-message">
                <strong>Unable to fetch system information</strong>
            </div>
            <div class="error-details">
                ${error instanceof Error ? error.message : 'Unknown error occurred'}
            </div>
        </div>
    </div>
</body>
</html>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }
};