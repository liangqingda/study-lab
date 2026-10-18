import ConceptPageLayout from '@/components/ConceptPageLayout';

/**
 * 学习路径第 2 步「核心架构：Host / Client / Server」的概念介绍页。
 * 内容依据：https://modelcontextprotocol.io/docs/architecture。
 */
const Architecture = () => (
  <ConceptPageLayout
    description="看懂一次 MCP 会话的骨架：三个角色各自管什么、如何建立连接、底层用什么消息。"
    title="核心架构：Host / Client / Server"
  >
    <p>
      MCP 采用<strong>客户端-主机-服务器</strong>（client-host-server）架构：一个主机（Host）可以创建并管理
      多个客户端（Client）实例，每个客户端与一个服务器（Server）保持一条专属连接。消息统一用
      <strong>JSON-RPC 2.0</strong> 编码传输。
    </p>

    <h2>三个角色的职责</h2>
    <table>
      <thead>
        <tr>
          <th>角色</th>
          <th>是什么</th>
          <th>管什么</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <code>Host</code>
          </td>
          <td>AI 应用的宿主进程（容器与协调者）</td>
          <td>创建并管理多个客户端实例；控制连接的权限与生命周期；执行安全策略与同意要求；处理用户授权；协调 LLM 集成与采样；跨客户端聚合上下文。</td>
        </tr>
        <tr>
          <td>
            <code>Client</code>
          </td>
          <td>Host 内的连接器（“信使”）</td>
          <td>每个服务器对应一个客户端；维护与服务器的专属连接；发起请求、接收结果，把能力“翻译”给模型。</td>
        </tr>
        <tr>
          <td>
            <code>Server</code>
          </td>
          <td>能力提供者（可独立运行的进程）</td>
          <td>通过 MCP 原语暴露资源、工具与提示；职责聚焦；按客户端请求提供上下文、执行操作；可请求采样。</td>
        </tr>
      </tbody>
    </table>

    <h2>一次会话如何建立</h2>
    <ol>
      <li>Host 按需要为每个服务器<strong>创建一个 Client</strong>。</li>
      <li>Client 通过传输层（本地 stdio 或远程 HTTP）与 Server 建立<strong>专属连接</strong>。</li>
      <li>双方握手，Server 声明<strong>能力（capabilities）</strong>，如支持哪些原语。</li>
      <li>Client 据此发现并调用 Server 暴露的<strong>原语</strong>，结果聚合回 Host 供模型使用。</li>
    </ol>

    <h2>底层消息</h2>
    <p>
      所有交互都是 JSON-RPC 2.0 消息：请求（request）、通知（notification）与响应（response）。
      传输层只负责“把消息送到”，不关心消息内容——这正是 MCP 可插拔传输的基础。
    </p>

    <h2>接下来</h2>
    <p>
      骨架清楚了，下一步看服务器真正暴露的<strong>三大原语</strong>：Tools、Resources、Prompts，从 Tools 开始。
    </p>
  </ConceptPageLayout>
);

export default Architecture;
