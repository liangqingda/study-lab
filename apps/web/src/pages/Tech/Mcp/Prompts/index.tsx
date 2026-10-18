import ConceptPageLayout from '@/components/ConceptPageLayout';

/**
 * 学习路径第 5 步「Prompts：可复用的提示模板」的概念介绍页。
 * 内容依据：https://modelcontextprotocol.io/docs/concepts/prompts。
 */
const Prompts = () => (
  <ConceptPageLayout
    description="理解“沉淀交互”的原语：可复用提示模板与工作流，如何发现、取回，以及它为什么是用户驱动的。"
    title="Prompts：可复用的提示模板"
  >
    <p>
      <strong>Prompts（提示）</strong>让服务器定义<strong>可复用的提示模板与工作流</strong>，客户端能轻松呈现给用户与模型。
      它是标准化、共享常见 LLM 交互的强力方式——例如“生成 Git 提交信息”“分析代码改进点”。
    </p>

    <h2>用户驱动</h2>
    <p>
      提示是<strong>用户驱动（user-controlled）</strong>的：由服务器暴露给客户端，意图是让<strong>用户显式选用</strong>——
      它出现在界面里像斜杠命令（slash command）、快速动作、命令面板、引导式工作流等。
    </p>

    <h2>提示的结构</h2>
    <p>每个提示包含：</p>
    <pre>{`{
  "name": "analyze-code",        // 唯一标识
  "description": "分析代码潜在改进点",
  "arguments": [                  // 可选参数列表
    { "name": "language", "description": "编程语言", "required": true }
  ]
}`}</pre>

    <h2>发现与使用</h2>
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
            <code>prompts/list</code>
          </td>
          <td>列出服务器可用的提示模板。</td>
        </tr>
        <tr>
          <td>
            <code>prompts/get</code>
          </td>
          <td>按名称与参数取回提示，返回可渲染给模型的消息列表。</td>
        </tr>
      </tbody>
    </table>

    <h2>动态与多步</h2>
    <p>提示可以是动态的：<strong>嵌入资源上下文</strong>（把某段日志或文件作为消息的一部分），也能<strong>串联多步</strong>（编排一段带角色的多轮对话，引导完成特定工作流）。服务器还可用 <code>notifications/prompts/list_changed</code> 通知客户端提示列表变化。</p>

    <h2>实现要点</h2>
    <ol>
      <li>使用清晰、描述性的提示名，并为提示与参数提供详细说明。</li>
      <li>校验所有必填参数，缺失时优雅处理。</li>
      <li>考虑模板版本化、缓存动态内容与错误处理。</li>
      <li>注意提示注入风险：校验参数、清理输入、审计用法、限流、设置超时。</li>
    </ol>

    <h2>接下来</h2>
    <p>三大原语都看过了，下一步看它们<strong>靠什么传输</strong>：stdio 与 Streamable HTTP。</p>
  </ConceptPageLayout>
);

export default Prompts;
