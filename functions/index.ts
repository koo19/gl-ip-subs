export interface Env {
}

export const onRequest = async (context: { request: Request; env: Env }) => {
  try {
    // 从项目根目录读取文件（public 目录中的文件会被部署到根目录）
    const response = await fetch(new URL('ip-subs.txt', context.request.url));
    if (!response.ok) {
      throw new Error(`Failed to fetch ip-subs.txt: ${response.status}`);
    }
    const ipSubsContent = await response.text();

    // 设置响应头
    const headers = new Headers();
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    headers.set('Content-Disposition', 'inline; filename="combined-ips.txt"');

    // 返回内容
    return new Response(ipSubsContent, {
      status: 200,
      headers: headers
    });

  } catch (error) {
    return new Response(`Error reading files: ${error.message}`, {
      status: 500
    });
  }
};
