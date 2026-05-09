import type { Customer } from "../types";

export const mockCustomers: Customer[] = [
  {
    id: "cus-wang",
    name: "王女士",
    memberLevel: "金刚",
    memberCardNo: "MD80001234",
    memberPhone: "138****6728",
    city: "上海",
    family: "夫妻 + 1个8岁孩子 + 父母",
    gmv: "268,000",
    lastTrip: "2024年 香格里拉环线",
    status: "暑期亲子需求已露出",
    tags: ["高净值家庭", "亲子", "喜欢慢节奏", "重视酒店体验", "关注餐饮", "怕高反", "复购潜力高"],
    summary:
      "王女士属于高价值家庭型客户，过去对松赞酒店体验反馈较好，偏好慢节奏、舒适型产品。由于客户家庭中有老人和孩子，不建议推荐高强度徒步和连续长车程产品。建议优先推荐梅里轻奢慢行、香格里拉深度体验、亲子自然教育主题产品。",
    orders: [
      { year: "2024", product: "香格里拉环线 6天5晚", amount: "¥118,000", feedback: "酒店景观和管家服务评价高" },
      { year: "2023", product: "松赞林卡假期 4天3晚", amount: "¥86,000", feedback: "偏好慢节奏和亲子活动" },
      { year: "2022", product: "会员私享活动", amount: "¥64,000", feedback: "关注餐饮和文化体验" },
    ],
  },
  {
    id: "cus-zhang",
    name: "张总",
    memberLevel: "金刚",
    memberCardNo: "MD80004519",
    memberPhone: "139****2186",
    city: "杭州",
    family: "夫妻同行，偶尔企业家朋友小团",
    gmv: "486,000",
    lastTrip: "2023年 梅里雪山私享线",
    status: "45天未维护，6月出行倾向强",
    tags: ["高净值企业家", "深度文化", "重视私密性", "偏好定制", "复购稳定", "关注司导水平"],
    summary:
      "张总是高净值企业家型复购客户，对松赞品牌和司导服务信任度较高，更看重私密性、文化深度和行程掌控感。过去3年均在6月前后出行，近期适合以梅里雪山夏季内容或滇藏线高端定制做轻触达，不宜发送过于大众化的产品清单。",
    orders: [
      { year: "2023", product: "梅里雪山私享线 6天5晚", amount: "¥168,000", feedback: "对司导专业度和私密安排评价高" },
      { year: "2022", product: "滇藏线高端定制 9天8晚", amount: "¥218,000", feedback: "喜欢深度文化内容，不喜欢赶路" },
      { year: "2021", product: "香格里拉企业家小团", amount: "¥100,000", feedback: "对同行客群质量敏感" },
    ],
  },
  {
    id: "cus-chen",
    name: "陈先生",
    memberLevel: "雪莲",
    memberCardNo: "MD80007862",
    memberPhone: "186****9035",
    city: "深圳",
    family: "夫妻 + 摄影朋友2人",
    gmv: "156,000",
    lastTrip: "2024年 林芝波密春季线",
    status: "国庆滇藏定制已咨询，等待报价",
    tags: ["摄影", "户外轻度", "关注景观", "时间敏感", "高转化", "可接受长线"],
    summary:
      "陈先生属于景观和摄影驱动型客户，对雪山、峡谷、林芝波密季节性景观兴趣强，可接受一定车程和轻户外，但对国庆档期和车辆安排敏感。当前应尽快补充滇藏线高端定制报价，并明确酒店库存、司导配置和每日拍摄窗口。",
    orders: [
      { year: "2024", product: "林芝波密春季线 7天6晚", amount: "¥96,000", feedback: "对摄影点位和时间安排满意" },
      { year: "2023", product: "香格里拉深度体验 5天4晚", amount: "¥60,000", feedback: "希望下一次行程更深度" },
    ],
  },
];

export const followUpCustomers = [
  { name: "张总", reason: "45天未维护，过去3年均在6月出行", level: "金刚", action: "发送梅里雪山夏季私享内容" },
  { name: "王女士", reason: "孩子暑假时间已确认，近期浏览梅里产品", level: "金刚", action: "推荐亲子自然探索方案" },
  { name: "陈先生", reason: "国庆滇藏定制咨询后未报价", level: "雪莲", action: "补充车辆与司导方案" },
];
