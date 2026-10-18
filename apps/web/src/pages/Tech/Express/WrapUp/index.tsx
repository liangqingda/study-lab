import ConceptPageLayout from '@/components/ConceptPageLayout';

import styles from './index.scss';

/**
 * 学习路径最后一步「串联完整链路与排查」的概念总结页。
 */
const WrapUp = () => (
  <ConceptPageLayout
    description="把请求链、中间件、错误处理、响应方法串成一个完整闭环，梳理常见误区与“请求不返回/返回异常”时的排查顺序。"
    title="串联完整链路与排查"
  >
    <p className={styles.lead}>
      三个实验分别放大了中间件、错误处理与响应方法。现在把它们放回同一条链路上，形成一张完整的图。
    </p>

    <h2>完整链路回顾</h2>
    <ol>
      <li>请求进入 → 应用级中间件先执行。</li>
      <li>按路径匹配路由，途中经过路由级中间件。</li>
      <li>处理函数用响应方法把结果发回客户端。</li>
      <li>任何环节出错 → 交给错误处理中间件统一响应。</li>
      <li>链路结束，连接关闭或按配置保持。</li>
    </ol>

    <h2>常见误区</h2>
    <table>
      <thead>
        <tr>
          <th>误区</th>
          <th>正解</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>中间件和路由顺序无所谓</td>
          <td>Express 按<strong>注册顺序</strong>执行，顺序直接决定行为。</td>
        </tr>
        <tr>
          <td>错误处理中间件随便放</td>
          <td>它必须带 4 个参数（<code>err, req, res, next</code>），且要放在路由之后。</td>
        </tr>
        <tr>
          <td>异步抛错会自动被捕获</td>
          <td>需要把错误交给 <code>next(err)</code>，或在 async 处理器里 try/catch 后再 next(err)。</td>
        </tr>
        <tr>
          <td><code>res.send</code> 之后还能继续写</td>
          <td>发送即结束本次响应，之后再次调用会抛错或产生重复响应头。</td>
        </tr>
      </tbody>
    </table>

    <h2>排查思路</h2>
    <ol>
      <li>
        <strong>请求没响应</strong>：先看处理函数是否调用了 <code>res</code>
        方法，是否在回调里提前 return 把链路断掉。
      </li>
      <li>
        <strong>状态码不对</strong>：确认 <code>res.status</code> 是否在发送之前设置。
      </li>
      <li>
        <strong>抛错没兜住</strong>：确认错误处理中间件存在、在末尾、签名是 4 个参数。
      </li>
      <li>
        <strong>用日志对照</strong>：后端按示例打印关键步骤，前端对照实际响应，
        两端一起定位断点在哪一环。
      </li>
    </ol>

    <h2>收尾</h2>
    <p>
      到这里，你已能看懂任意 Express 接口的「请求 → 中间件 → 路由 → 响应 → 错误」完整闭环。
    </p>
  </ConceptPageLayout>
);

export default WrapUp;
