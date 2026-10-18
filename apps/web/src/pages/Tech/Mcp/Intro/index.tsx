import ConceptPageLayout from '@/components/ConceptPageLayout';

/**
 * 学习路径第 1 步「认识 MCP：为什么需要它」的概念介绍页。
 * 内容依据：https://modelcontextprotocol.io/docs（Introduction）。
 */
const Intro = () => (
  <ConceptPageLayout
    description="在动手接入前，先建立 MCP 的全局图景：它是什么、解决什么问题、对谁有价值。"
    title="认识 MCP：为什么需要它"
  >
    <p>
      <strong>MCP（Model Context Protocol）</strong>是一个开源标准，用于把 AI 应用连接到外部系统：
      数据源（本地文件、数据库）、工具（搜索引擎、计算器）与工作流（专用提示词），让模型能取到关键信息并执行任务。
      官方用一个形象的比喻——<strong>MCP 之于 AI 应用，就像 USB-C 之于电子设备</strong>：USB-C 用统一接口连接各类设备，
      MCP 用统一协议连接 AI 应用与外部系统。
    </p>

    <h2>它在连接谁</h2>
    <p>
      一次 MCP 会话横跨两侧，中间是标准化的 MCP 协议，数据<strong>双向流动</strong>：
    </p>
    <table>
      <thead>
        <tr>
          <th>一侧</th>
          <th>代表</th>
          <th>说明</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>AI 应用</td>
          <td>聊天界面、IDE/代码编辑器、其它 AI 应用</td>
          <td>接入外部能力的“需求方”，例如 Claude Desktop、Claude Code、Cursor。</td>
        </tr>
        <tr>
          <td>数据源与工具</td>
          <td>数据与文件系统、开发工具、生产力工具</td>
          <td>提供能力与上下文的“供给方”，例如 PostgreSQL、Git、Slack、Google Maps。</td>
        </tr>
      </tbody>
    </table>

    <h2>解决什么问题</h2>
    <p>在 MCP 之前，接入一个外部能力往往要写一套专属集成，重复且难维护。MCP 把「AI 应用 ↔ 外部系统」的通信收拢成标准协议，实现“构建一次、到处接入”。</p>
    <ol>
      <li><strong>对开发者</strong>：减少构建/集成 AI 应用时的开发时间与复杂度。</li>
      <li><strong>对 AI 应用或 Agent</strong>：获得数据源、工具与应用的生态，增强能力、改善最终体验。</li>
      <li><strong>对终端用户</strong>：得到能力更强的应用——能访问数据、在必要时代替用户执行操作。</li>
    </ol>

    <h2>生态支持</h2>
    <p>
      MCP 是开放协议，已被广泛客户端与服务器支持：Claude、ChatGPT 等 AI 助手，Visual Studio Code、Cursor
      等开发工具，以及众多 MCP 服务器生态。这让“写一次服务器，接入所有支持 MCP 的客户端”成为可能。
    </p>

    <h2>接下来</h2>
    <p>
      下一步拆开 MCP 的<strong>三角色</strong>：Host 怎么组织、Client 怎么连接、Server 怎么提供能力，看懂一次会话的骨架。
    </p>
  </ConceptPageLayout>
);

export default Intro;
