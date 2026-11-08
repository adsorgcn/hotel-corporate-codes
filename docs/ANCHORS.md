# 酒店协议代码数据集的文献引用

本数据集的描述引用下列固定层级定价、酒店价格围栏及收益管理文献。论文用于解释相关概念，不是酒店代码的来源，也没有验证目录内任何代码的现行价格、资格或可订状态。论文作者仅出现在参考文献中。

## 进图谱的文献

解析日期均为 **2026-11-08**。`Handle 200 / 1` 表示 DOI Handle API 的 HTTP 状态为 200 且 `responseCode=1`；`Crossref 200` 表示元数据接口返回 200。五篇的请求 DOI 与 Crossref `DOI` 字段一致。题名、期刊、作者和日期字段的接口证据在 [anchors-api-evidence.json](evidence/anchors-api-evidence.json)，规范化结果在 [anchors-metadata.json](evidence/anchors-metadata.json)。

| DOI 与解析状态 | 题名 | 期刊、年份、作者姓 | relation | why | 解析日期 |
|---|---|---|---|---|---|
| [10.1177/19389655231152456](https://doi.org/10.1177/19389655231152456)；[Handle](https://doi.org/api/handles/10.1177/19389655231152456) 200 / 1；[Crossref](https://api.crossref.org/works/10.1177/19389655231152456) 200 | Revenue Analytics: The Problem With Fixed-Tier Pricing | Cornell Hospitality Quarterly；2023；Ma、Schwartz | `cites` | 解释固定比例围栏折扣与逐客群定价的区别；该文指出固定层级定价可能次优，不能据此承诺协议码优惠或定价效果。 | 2026-11-08 |
| [10.1177/1938965513507497](https://doi.org/10.1177/1938965513507497)；[Handle](https://doi.org/api/handles/10.1177/1938965513507497) 200 / 1；[Crossref](https://api.crossref.org/works/10.1177/1938965513507497) 200 | Rate Fences in Hotel Revenue Management and Their Applications to Chinese Leisure Travelers: A Fractional Factorial Design Approach | Cornell Hospitality Quarterly；2014；Denizci Guillet、Law、Xiao | `references` | 研究酒店价格限制、预订条件和退款条件的取舍，为把代码资格与价格条件分开记录提供背景。 | 2026-11-08 |
| [10.1080/10548408.2015.1063825](https://doi.org/10.1080/10548408.2015.1063825)；[Handle](https://doi.org/api/handles/10.1080/10548408.2015.1063825) 200 / 1；[Crossref](https://api.crossref.org/works/10.1080/10548408.2015.1063825) 200 | Segmenting Hotel Customers Based on Rate Fences Through Conjoint and Cluster Analysis | Journal of Travel & Tourism Marketing；2015；Denizci Guillet、Guo、Law | `references` | 以房价与价格围栏划分酒店客群，为资格、限制与客群不能混作统一优惠的描述提供背景。 | 2026-11-08 |
| [10.1177/0010880404270032](https://doi.org/10.1177/0010880404270032)；[Handle](https://doi.org/api/handles/10.1177/0010880404270032) 200 / 1；[Crossref](https://api.crossref.org/works/10.1177/0010880404270032) 200 | Impact of Information on Customer Fairness Perceptions of Hotel Revenue Management | Cornell Hotel and Restaurant Administration Quarterly；2005；Choi、Mattila | `references` | 研究说明酒店定价条件与顾客公平感之间的关系，为明确披露资格和限制条件提供背景。 | 2026-11-08 |
| [10.1016/j.tourman.2016.02.006](https://doi.org/10.1016/j.tourman.2016.02.006)；[Handle](https://doi.org/api/handles/10.1016/j.tourman.2016.02.006) 200 / 1；[Crossref](https://api.crossref.org/works/10.1016/j.tourman.2016.02.006) 200 | Strategic and tactical price decisions in hotel revenue management | Tourism Management；2016；Abrate、Viglia | `references` | 讨论酒店价格的战略与短期情境因素，为代码目录不等于实时房价或可订承诺提供收益管理背景。 | 2026-11-08 |

年份采用已刊卷期年份。Denizci Guillet、Law 与 Xiao 一文在线发表于 2013-11-28，卷期发表于 2014 年 5 月；[出版方页面](https://journals.sagepub.com/doi/10.1177/1938965513507497)和 Crossref 都保留这两个日期。本表采用 2014，并未把在线首发年份改写为 2014。

固定层级折扣是一种定价形式，不能把所有企业协议价都等同于固定比例折扣。Ma 与 Schwartz 的[作者接受稿](https://udspace.udel.edu/server/api/core/bitstreams/395bec67-d12b-4c50-992d-bde878ca4191/content)讨论这种形式的局限；本数据集没有据此计算或证明最优价格。

同行评审及内容核对依据：

- Cornell Hospitality Quarterly 的[出版方期刊说明](https://in.sagepub.com/en-in/ind/journal/cornell-hospitality-quarterly)说明其同行评审性质；Choi 与 Mattila 的[文章页](https://journals.sagepub.com/doi/abs/10.1177/0010880404270032)标记为研究论文并给出原期刊名。
- Denizci Guillet、Guo 与 Law 的[作者所在大学记录](https://research.polyu.edu.hk/en/publications/segmenting-hotel-customers-based-on-rate-fences-through-conjoint-/)标记为同行评审论文，摘要说明其酒店客群与价格围栏主题。
- Abrate 与 Viglia 的[作者大学记录](https://researchportal.port.ac.uk/en/publications/strategic-and-tactical-price-decisions-in-hotel-revenue-managemen/)标记为同行评审论文；[接受稿](https://pure.port.ac.uk/ws/portalfiles/portal/7066906/Strategic_and_tactical_price_decisions_in_hotel_revenue_management_postprint.pdf)用于核对定价情境。

## 只做延伸阅读的材料

| 材料 | 作者、出版方、日期 | 关系与范围 | 核验日期 |
|---|---|---|---|
| [Hilton HHonors Worldwide: Loyalty Wars](https://store.hbr.org/product/hilton-hhonors-worldwide-loyalty-wars/501010)；官方产品页 HTTP 200 | John Deighton、Stowe Shoemaker；Harvard Business Publishing，来源标注 Harvard Business School；2000-10-12；产品 501010 | 忠诚度与常客营销案例，是酒店客群管理的相邻主题。所查官方产品记录未列 DOI；仅在 Further reading 中引用，不写入 `related_identifiers`。 | 2026-11-08 |

## 排除项与访问限制

候选 `10.1177/0010880402434010` 的 Handle 返回 200 / 1，但 Crossref 回读的 DOI 为 `10.1016/s0010-8804(02)80046-5`，作者字段仅列 R. Hanks；出版方页面列三位作者。本次没有把别名和不完整作者字段拼接成通过项，因此该候选不进入五篇引用集合。完整返回值的书目字段已保留在 API 证据文件中。这是元数据映射不一致，不是 DOI 不存在。

部分出版方网页的直接访问受限。DOI 注册和书目核对通过 Handle 与 Crossref 完成；主题判断来自出版方可读摘要或作者大学的公开记录、接受稿。未购买或绕过全文访问权限。公开来源的状态码与响应摘要见 [anchors-source-receipts.json](evidence/anchors-source-receipts.json)。

复核命令（退出码 0；五篇通过，一篇候选排除）：

```powershell
python -X utf8 docs/evidence/anchors-verify.py
python -X utf8 docs/evidence/anchors-build.py
```
