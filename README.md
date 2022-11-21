# 子图匹配（同构）问题 - Subgraph Isomorphism

## 演示地址

<https://fred8617.github.io/subgraph-isomorphism-example>

## 说明

本项目用C语言实现了三个子图匹配（同构）算法 - ULLMANN(乌尔曼算法)、VF、VF2，其中ULLMANN算法有两个文件，分别是ULLMANN_SAMPLE.c和ULLMANN.c，ULLMANN_SAMPLE.c是参考[1]中原作者所写伪代码，其中大量使用goto语句（我们这里用的是switch），所以在大量结点的图上会出现奇怪bug并难以修复，所以遵从原文的思想又用自己的语言重新对算法进行了实现，即ULLMANN.c。VF.c与VF2.c则对应VF与VF2算法。这些c语言文件在文件内都提供了简单的例子可以调用，但是为了编译成wasm文件，源文件中并没有任何输出语句，所以建议使用[演示地址](https://fred8617.github.io/subgraph-isomorphism-example)对各个算法进行查验。

注：

1. 为了方便查看实际效果，本项目提供了[演示地址](https://fred8617.github.io/subgraph-isomorphism-example)，所用技术为react+antv/g6+wasm+web worker，将c语言编译成了wasm二进制文件直接提供给浏览器调用。
2. 所有算法的图均为邻接矩阵表示
3. 所有算法均使用无向图
4. 推荐最大结点数量：原图100，子图3（子图点数过多会导致内存溢出结果异常，如ULLMANN与其他方法查出结果数量不一致则是内存溢出导致的）。

## 算法

### ULLMANN（乌尔曼算法）

ULLMANN算法[1]是最早（1976年）提出的子图匹配（同构）算法，算法的核心思想是：对于给定的图A（顶点数a）与图B（顶点数b），我们需要找到一个axb的矩阵M（M的每一行必有且只有一个元素为1，其余为0，每一列最多一个元素为1可没有，其余为0），并求得一个axa矩阵C=M(MB)^T^，如果所有在邻接矩阵A中等于1的点同时在C中也等于1，那么我们则认为图A是图B的一个子图，而顶点的对应关系则是M中为1的点的行与列，行数代表A中点的索引，列数代表B中点的索引。
例：
如果求得矩阵M如下：则同构的图为A(1,2,3)=B(1,2,4)
 <table>
    <tr><td></td><td>B1</td><td>B2</td><td>B3</td><td>B4</td></tr>
    <tr><td>A1</td><td>1</td><td>0</td><td>0</td><td>0</td></tr>
    <tr><td>A2</td><td>0</td><td>1</td><td>0</td><td>0</td></tr>
    <tr><td>A3</td><td>0</td><td>0</td><td>0</td><td>1</td></tr>
 </table>
 我们接下来的目的就是找到所有这样的M矩阵，所以要使用暴力枚举法，在枚举之前我们先做一个axb的矩阵M0,这个矩阵的行代表A中点的索引，列代表B中点的索引，如果B中点的度大于A中点的度则值为1，否则为0。接下来就是暴力枚举M0中的所有M。采用深度优先递归策略，每一行选中一个1后向下一行继续，以此类推。伪代码如下：

 ![ULLMANN CODE](/public/ULLMANN_CODE.jpg)
 
 ### VF

VF算法[2]在1998年提出，算法的主要思想是SSR(State Space Representation)，此算法主要在于找到一个M={(n,m) belongs to N1xN2 },N1为G1中的所有点，n则是N1中的一点，N2为G2中的所有点，m则是N2中的一点。算法从子图G2最小索引点开始，与原图G1所有点依次形成初始序列，然后进而采取枚举策略一步一步添加安全（中间有校验是否安全的过程）的点，直到最后形成M。添加点的过程，每添加一对点都记录一个对应的状态State。算法伪代码如下：

![VF CODE](/public/VF_CODE.jpg)

### VF2

VF2算法则是原作者在VF算法上进行了空间优化以及对校验安全点与选点的过程进行了缓存，可以使最差时间为N1+N2。

以上所有算法具体细节可以看对应的代码注释

### 算法时空复杂度对比

![VF ULLMANN](/public/ST1.jpg)
![V2 ULLMANN](/public/ST2.jpg)

####参考文献

1. An Algorithm for Subgraph Isomorphism J. R. ULLMANN - 1976
2. Subgraph Transformations for the Inexact Matching of Attributed Relational Graphs L. P. CordelIa, P. Foggia, C. Sansone, and M. Vento, Naples - 1998
3. Performance Evaluation of the VF Graph Matching Algorithm L.P.Cordella,P.Foggia,C.Sansone,M.Vento Dipartimento di Informatica e Sistemistica-Via Claudio,21-I-80125 Napoli (Italy) - 1999
4. Fast Graph Matching for Detecting CAD Image Components L.P. Cordella, P. Foggia, C. Sansone, M. Vento Dipartimento di Informatica e Sistemistica - Via Claudio, 21 - I-80125 Napoli (Italy) - 2000
5. An Improved Algorithm for Matching Large Graphs L. P. Cordella, P. Foggia, C. Sansone, M. Vento - 2001
6. A (Sub)Graph Isomorphism Algorithm for Matching Large Graphs Luigi P. Cordella, Pasquale Foggia, Carlo Sansone, and Mario Vento - 2004