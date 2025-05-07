export interface Env {
}

export const onRequest = async (context: { request: Request; env: Env }) => {
  try {
    // Read both files from the root directory
    const [ipSubsContent] = await Promise.all([
      fetch('/ip-subs.txt').then(res => res.text())
    ]);

    // Concatenate the content
    const combinedContent = `${ipSubsContent}`;

    // Set up response headers
    const headers = new Headers();
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    headers.set('Content-Disposition', 'inline; filename="combined-ips.txt"');

    // Return the combined content
    return new Response(combinedContent, {
      status: 200,
      headers: headers
    });

  } catch (error) {
    return new Response(`Error reading files: ${error.message}`, {
      status: 500
    });
  }
};
