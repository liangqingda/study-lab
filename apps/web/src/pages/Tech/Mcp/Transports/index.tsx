import ConceptPageLayout from '@/components/ConceptPageLayout';

/**
 * 学习路径第 6 步「Transports：客户端与服务器如何通信」的概念介绍页。
 * 内容依据：https://modelcontextprotocol.io/docs/transports 及规范 basic/transports。
 */
const Transports = () => (
  <ConceptPageLayout
    description="理解 MCP 消息靠什么“送到”：JSON-RPC 之上，本地 stdio 与远程 Streamable HTTP 两种标准传输。"
    title="Transports：客户端与服务器如何通信"
  >
    <p>
      MCP 消息统一用 <strong>JSON-RPC 2.0</strong> 编码（必须为 UTF-8）。传输层（transport）负责把消息从一端送到另一端。
      协议目前定义两种<strong>标准传输</strong>，也允许客户端与服务器实现<strong>自定义传输</strong>。
    </p>

    <h2>stdio（标准输入输出）</h2>
    <ul>
      <li>客户端把 MCP 服务器<strong>作为子进程启动</strong>。</li>
      <li>服务器从 <code>stdin</code> 读 JSON-RPC 消息，向 <code>stdout</code> 写消息。</li>
      <li>消息用<strong>换行符分隔</strong>，且内容不能包含内嵌换行。</li>
      <li>适合<strong>本地集成</strong>、命令行工具、单进程通信；本地服务器通常一个客户端对应一个服务器。</li>
    </ul>

    <h2>Streamable HTTP（可流式 HTTP）</h2>
    <ul>
      <li>每条消息是发往<strong>单个 MCP 端点</strong>的一次 HTTP POST。</li>
      <li>响应可以是<strong>单个 JSON 对象</strong>，或<strong>请求作用域的 SSE 流</strong>（支持流式结果）。</li>
      <li>适合<strong>远程服务器</strong>、Web 场景，多个客户端可共享一个端点。</li>
    </ul>

    <h2>怎么选</h2>
    <table>
      <thead>
        <tr>
          <th>维度</th>
          <th>stdio</th>
          <th>Streamable HTTP</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>部署位置</td>
          <td>本地（子进程）</td>
          <td>远程（HTTP 端点）</td>
        </tr>
        <tr>
          <td>典型场景</td>
          <td>本地开发工具、命令行集成</td>
          <td>Web 应用、跨机器/网络接入</td>
        </tr>
        <tr>
          <td>连接关系</td>
          <td>通常一个服务器对应一个客户端</td>
          <td>多客户端共享端点</td>
        </tr>
      </tbody>
    </table>
    <p>官方建议：客户端在可能的情况下<strong>优先支持 stdio</strong>。</p>

    <h2>可插拔</h2>
    <p>传输是<strong>可插拔（pluggable）</strong>的：只要满足“携带 MCP 消息”的职责，就可以实现自定义传输，协议层不绑定具体载体。</p>

    <h2>接下来</h2>
    <p>消息怎么送也清楚了，最后把三角色、三大原语与传输<strong>串成一个完整会话</strong>，并梳理安全最佳实践。</p>
  </ConceptPageLayout>
);

export default Transports;
