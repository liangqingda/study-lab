import ConceptPageLayout from '@/components/ConceptPageLayout';

/**
 * 学习路径第 4 步「Resources：给模型提供上下文」的概念介绍页。
 * 内容依据：https://modelcontextprotocol.io/docs/concepts/resources。
 */
const Resources = () => (
  <ConceptPageLayout
    description="理解“给模型提供上下文”的原语：用 URI 标识的数据、如何发现与读取，以及应用如何决定何时纳入。"
    title="Resources：给模型提供上下文"
  >
    <p>
      <strong>Resources（资源）</strong>让服务器向客户端暴露<strong>上下文数据</strong>：文件、数据库 schema、应用专属信息等。
      每个资源用唯一 <strong>URI</strong> 标识，供语言模型在回答时引用，而不必把内容全塞进提示。
    </p>

    <h2>应用驱动</h2>
    <p>
      资源是<strong>应用驱动（application-driven）</strong>的：由宿主应用决定何时把哪些上下文纳入，例如在界面里展示资源树让用户勾选、
      允许用户搜索过滤、或按启发式/模型选择自动纳入。协议不强制具体的交互方式，交由实现自由发挥。
    </p>

    <h2>发现与读取</h2>
    <table>
      <thead>
        <tr>
          <th>消息</th>
          <th>作用</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <code>resources/list</code>
          </td>
          <td>列出可用资源（支持分页）。</td>
        </tr>
        <tr>
          <td>
            <code>resources/read</code>
          </td>
          <td>读取某个资源的实际内容。</td>
        </tr>
        <tr>
          <td>
            <code>resources/templates/list</code>
          </td>
          <td>暴露参数化资源模板，例如 <code>file:///&#123;path&#125;</code>。</td>
        </tr>
        <tr>
          <td>
            <code>resources/subscribe</code>
          </td>
          <td>订阅某个资源的变更，通过 <code>notifications/resources/updated</code> 收到更新。</td>
        </tr>
      </tbody>
    </table>

    <h2>资源长什么样</h2>
    <p>一个资源定义包含 <code>uri</code>、<code>name</code>，以及可选的 <code>title</code>、<code>description</code>、<code>mimeType</code>、<code>size</code>。读取返回的内容可以是文本或二进制：</p>
    <pre>{`// 文本内容
{ "uri": "file:///example.txt", "mimeType": "text/plain", "text": "Resource content" }

// 二进制内容
{ "uri": "file:///example.png", "mimeType": "image/png", "blob": "base64-encoded-data" }`}</pre>

    <h2>常见 URI scheme</h2>
    <p>协议定义了几种标准 scheme：<code>https://</code>（客户端能自行从网页加载时用）、<code>file://</code>（类文件系统资源）、<code>git://</code>（Git 集成），也允许按 RFC 3986 定义自定义 scheme。</p>

    <h2>安全要点</h2>
    <ol>
      <li>服务器<strong>必须</strong>校验所有资源 URI。</li>
      <li>敏感资源<strong>应该</strong>实现访问控制。</li>
      <li>二进制数据<strong>必须</strong>正确编码。</li>
      <li>操作前<strong>应该</strong>检查资源权限。</li>
    </ol>

    <h2>接下来</h2>
    <p>资源给模型“有据可依”，下一步看 <strong>Prompts</strong>：如何用可复用模板沉淀常见交互。</p>
  </ConceptPageLayout>
);

export default Resources;
