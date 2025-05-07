export interface Env {
  GITHUB_TOKEN: string;
}

export const onRequest = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  
  // 从环境变量中获取 GitHub Token
  const githubToken = env.GITHUB_TOKEN;
  if (!githubToken) {
    return new Response("GitHub Token not found in env", { status: 500 });
  }

  // 通过 URL 查询参数传入文件信息
  const url = new URL(request.url);
  const owner = url.searchParams.get("owner") || "koo19";
  const repo = url.searchParams.get("repo") || "gl-ip-subs";
  let ref = url.searchParams.get("ref") || "main";
  if (ref.startsWith("refs/heads/")) {
    ref = ref.substring("refs/heads/".length);
  }
  const path = url.searchParams.get("path") || "cn-ip-subs.txt";

  // 构造 GitHub API 的 URL
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;

  // 配置请求头：认证、Accept 和 User-Agent
  const headers = new Headers();
  headers.set("Authorization", `token ${githubToken}`);
  headers.set("Accept", "application/vnd.github.v3.raw");
  headers.set("User-Agent", "Cloudflare-Worker-Proxy");

  // 发起请求到 GitHub API
  const response = await fetch(apiUrl, { method: "GET", headers });

  if (!response.ok) {
    const errorText = await response.text();
    return new Response(
      `GitHub API Error: ${response.status} ${response.statusText}\n${errorText}`,
      { status: response.status }
    );
  }

  // 获取响应的 Content-Type
  const contentType = response.headers.get("Content-Type") || "text/plain";

  // 从 path 中提取文件名
  const filename = path.split("/").pop() || "downloaded_file";

  // 构造返回响应时的头部，加入 Content-Disposition 以保留原始文件名
  const respHeaders = new Headers();
  respHeaders.set("Content-Type", contentType);
  // 使用 inline 可直接在浏览器显示，若希望触发下载可改为 attachment
  respHeaders.set("Content-Disposition", `inline; filename="${filename}"`);
  
  return new Response(response.body, {
    status: 200,
    headers: respHeaders,
  });
};
