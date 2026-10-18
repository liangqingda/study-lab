import ConceptPageLayout from '@/components/ConceptPageLayout';

import styles from './index.scss';

/**
 * 学习路径第 1 步「认识 Express 与请求处理模型」的概念介绍页。
 */
const Intro = () => (
  <ConceptPageLayout
    description="在动手前，先建立整条链路的共同语言：一个请求进来，Express 究竟做了什么，才把响应还给你。"
    title="认识 Express 与请求处理模型"
  >
    <p className={styles.lead}>
      Express 是 Node.js 上最流行的 Web 框架。它不替你完成全部事情，而是把「处理
      HTTP 请求」这件重复的事收拢成一套清晰模型：<strong>注册路由、挂中间件、写响应</strong>
      。其余交给 Node 的底层与你的业务逻辑补齐。
    </p>

    <h2>三个关键对象</h2>
    <p>整条链路几乎只围绕三个对象转：</p>
    <table>
      <thead>
        <tr>
          <th>对象</th>
          <th>是谁</th>
          <th>在这条链里管什么</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <code>app</code>
          </td>
          <td>应用实例</td>
          <td>全局配置、注册路由与中间件、错误处理兜底，负责「安排谁来处理」。</td>
        </tr>
        <tr>
          <td>
            <code>req</code>
          </td>
          <td>请求对象</td>
          <td>方法、URL、查询参数、请求体、请求头，描述「这次请求长什么样」。</td>
        </tr>
        <tr>
          <td>
            <code>res</code>
          </td>
          <td>响应对象</td>
          <td>状态码、响应头，以及把结果发回客户端的响应方法，决定「返回什么」。</td>
        </tr>
      </tbody>
    </table>

    <h2>一次请求的旅程</h2>
    <ol>
      <li>请求到达，Express 按<strong>注册顺序</strong>把它交给第一个匹配的中间件或路由。</li>
      <li>中间件依次执行：可以提前响应，也可以调用 next 把控制权交给下一个。</li>
      <li>命中路由的处理函数，读取 <code>req</code>，用 <code>res</code> 发出响应。</li>
      <li>若中途出错，交给错误处理中间件，统一返回错误。</li>
      <li>响应回到客户端，本次链路结束。</li>
    </ol>

    <h2>接下来</h2>
    <p>
      后面的实验会逐个放大这些环节：先看中间件怎么排队，再看错误怎么被接住，最后看响应方法怎么把结果交给客户端。
    </p>
  </ConceptPageLayout>
);

export default Intro;
