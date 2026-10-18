import ConceptPageLayout from '@/components/ConceptPageLayout';

/**
 * 学习路径第 3 步「Tools：让模型调用外部能力」的概念介绍页。
 * 内容依据：https://modelcontextprotocol.io/docs/concepts/tools 及规范 server/tools。
 */
const Tools = () => (
  <ConceptPageLayout
    description="理解模型如何“动手”：发现工具、调用工具，以及工具为什么是“模型驱动”的。"
    title="Tools：让模型调用外部能力"
  >
    <p>
      <strong>Tools（工具）</strong>是 MCP 服务器暴露给语言模型<strong>调用</strong>的能力：查询数据库、调用 API、
      执行计算、读写文件等。工具让模型能<strong>作用于外部系统</strong>，而不只是读上下文。每个工具由
      <strong>名称</strong>唯一标识，并用 JSON Schema 描述其输入。
    </p>

    <h2>模型驱动</h2>
    <p>
      工具是<strong>模型驱动（model-driven）</strong>的：由模型根据对话决定何时调用哪个工具、传什么参数；
      具体是否需要用户批准，取决于客户端的实现策略。这与 Resources 的“应用驱动”形成对比。
    </p>

    <h2>发现工具：tools/list</h2>
    <p>客户端先请求服务器列出可用工具（可能带分页）：</p>
    <pre>{`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}`}</pre>
    <p>响应里每个工具带名称、描述与 <code>inputSchema</code>（JSON Schema），模型据此知道能调用什么、怎么传参。</p>

    <h2>调用工具：tools/call</h2>
    <p>模型选中工具后，客户端发送调用请求：</p>
    <pre>{`{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_weather",
    "arguments": { "location": "New York" }
  }
}`}</pre>
    <p>服务器执行操作并返回结果（通常是结构化内容或文本），客户端再把结果交回给模型继续推理。</p>

    <h2>关键点</h2>
    <ol>
      <li><strong>发现与调用分离</strong>：先 <code>tools/list</code> 摸清能力，再 <code>tools/call</code> 触发执行。</li>
      <li><strong>Schema 驱动</strong>：用 JSON Schema 描述入参，客户端据此生成可校验的参数。</li>
      <li><strong>有副作用</strong>：调用工具可能写数据、联网、执行操作，因此“何时允许调用”常需要用户同意与安全约束。</li>
    </ol>

    <h2>接下来</h2>
    <p>工具让模型“动手”，下一步看让模型“有据可依”的 <strong>Resources</strong>：如何给模型提供上下文数据。</p>
  </ConceptPageLayout>
);

export default Tools;
