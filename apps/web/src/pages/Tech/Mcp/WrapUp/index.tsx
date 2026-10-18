import ConceptPageLayout from '@/components/ConceptPageLayout';

/**
 * 学习路径第 7 步「串联完整链路与安全最佳实践」的概念介绍页（收尾）。
 * 内容依据：https://modelcontextprotocol.io/docs 各子页（Architecture / Security）。
 */
const WrapUp = () => (
  <ConceptPageLayout
    description="把三角色、三大原语与传输串成一次完整会话，并梳理构建与接入时的安全最佳实践，收尾巩固。"
    title="串联完整链路与安全最佳实践"
  >
    <p>
      到这里，MCP 的骨架与血肉都齐了：<strong>Host / Client / Server</strong> 三个角色、<strong>Tools / Resources /
      Prompts</strong> 三大原语、<strong>stdio / Streamable HTTP</strong> 两种传输，底层统一走 <strong>JSON-RPC 2.0</strong>。
    </p>

    <h2>一次完整会话</h2>
    <ol>
      <li>Host 为每个服务器创建一个 <strong>Client</strong>，通过传输层建立连接。</li>
      <li>握手后 Server 声明<strong>能力</strong>（支持哪些原语与可选特性）。</li>
      <li>Client 据此发现原语：<code>tools/list</code>、<code>resources/list</code>、<code>prompts/list</code>。</li>
      <li>模型<strong>调用工具</strong>（tools/call）、<strong>读取资源</strong>（resources/read）、或按<strong>提示模板</strong>组织对话（prompts/get）。</li>
      <li>结果通过 Client 聚合回 Host，供模型继续推理并最终回应用户。</li>
    </ol>

    <h2>构建一个 MCP 服务（参考）</h2>
    <ul>
      <li>用官方 SDK（TypeScript 或 Python）创建 <code>Server</code>，声明名称与版本。</li>
      <li>在 <code>capabilities</code> 里声明支持的资源/工具/提示及可选特性（如 <code>subscribe</code>、<code>listChanged</code>）。</li>
      <li>为每个原语注册请求处理器（<code>list</code>/<code>read</code>/<code>call</code>/<code>get</code> 等）。</li>
      <li>按部署位置选择传输：本地用 stdio，远程用 Streamable HTTP。</li>
    </ul>

    <h2>安全与信任（重点）</h2>
    <table>
      <thead>
        <tr>
          <th>要点</th>
          <th>说明</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>输入校验</td>
          <td>校验所有 URI、工具参数与提示参数；清理用户输入。</td>
        </tr>
        <tr>
          <td>访问控制</td>
          <td>敏感资源/操作实现访问控制与权限检查，遵循<strong>最小权限</strong>。</td>
        </tr>
        <tr>
          <td>用户同意</td>
          <td>有副作用的调用（写数据、联网、执行）在必要时征得用户同意。</td>
        </tr>
        <tr>
          <td>注入防护</td>
          <td>警惕提示注入：校验参数、审计用法、限流、设置超时。</td>
        </tr>
        <tr>
          <td>数据安全</td>
          <td>二进制正确编码；敏感数据妥善处理；验证生成内容。</td>
        </tr>
      </tbody>
    </table>

    <h2>小结</h2>
    <p>
      MCP 的核心是把「AI 应用连接外部系统」这件事<strong>标准化</strong>：用三个角色组织连接、用三个原语表达能力、
      用可插拔传输适配本地与远程。理解这套心智模型后，无论接入现成服务器还是自己构建，都能清楚地回答：
      “谁在连接、暴露了什么、靠什么传输、如何保证安全”。
    </p>
  </ConceptPageLayout>
);

export default WrapUp;
