import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Bell,
  Boxes,
  CheckCircle2,
  GitBranch,
  LayoutDashboard,
  ListTree,
  MonitorCog,
  Search,
  Settings2,
  ShieldCheck,
  Tags,
  UserCog,
} from "lucide-react";
import { useMemo, useState } from "react";

type AdminMenuKey = "overview" | "tags" | "flow" | "matching" | "profile" | "reminders" | "records";

type AdminMenuItem = {
  key: AdminMenuKey;
  label: string;
  description: string;
  icon: LucideIcon;
};

type AdminModule = {
  title: string;
  description: string;
  metrics: Array<{ label: string; value: string; trend: string }>;
  sections: Array<{ title: string; items: string[] }>;
  table: Array<{ name: string; owner: string; status: string; updatedAt: string }>;
};

type ProductTagField =
  | "emotionalNeeds"
  | "travelCompanions"
  | "preferencePrimary"
  | "preferenceSecondary"
  | "altitudeExperience"
  | "travelNode"
  | "budget"
  | "destinationIntent"
  | "duration";

type ProductMatrixRow = {
  id: string;
  series: string;
  name: string;
  route: string;
  businessType: string;
} & Record<ProductTagField, string[]>;

type MatchingWeightScenario = {
  id: string;
  name: string;
  trigger: string;
  triggerTags: string[];
  weights: Record<string, number>;
};

const adminMenus: AdminMenuItem[] = [
  { key: "overview", label: "管理总览", description: "助手能力开关与发布状态", icon: LayoutDashboard },
  { key: "tags", label: "标签词典", description: "维度、枚举与启用范围", icon: Tags },
  { key: "flow", label: "沟通流程", description: "阶段、话术和问题树", icon: ListTree },
  { key: "matching", label: "产品匹配", description: "标签映射与推荐规则", icon: Boxes },
  { key: "profile", label: "客户画像", description: "字段、客史和偏好配置", icon: UserCog },
  { key: "reminders", label: "提醒待办", description: "提醒模板与触发规则", icon: Bell },
  { key: "records", label: "沟通记录", description: "推荐演化和转化链路", icon: GitBranch },
];

const productMatrixFields: Array<{ key: ProductTagField; label: string }> = [
  { key: "emotionalNeeds", label: "情感需求" },
  { key: "travelCompanions", label: "出行组合" },
  { key: "preferencePrimary", label: "主偏好" },
  { key: "preferenceSecondary", label: "次偏好" },
  { key: "altitudeExperience", label: "高原经验" },
  { key: "travelNode", label: "旅行节点" },
  { key: "budget", label: "预算" },
  { key: "destinationIntent", label: "意向目的地" },
  { key: "duration", label: "出行天数" },
];

const weightDimensions = [
  { key: "emotion", label: "情感需求" },
  { key: "travelNode", label: "旅行节点" },
  { key: "companions", label: "出行组合" },
  { key: "budget", label: "预算" },
  { key: "duration", label: "出行天数" },
  { key: "preference", label: "出行偏好" },
  { key: "destination", label: "意向目的地" },
  { key: "altitude", label: "高原经验" },
];

const defaultProductMatrixRows: ProductMatrixRow[] = [
  {
    id: "product-001",
    series: "基本盘",
    name: "亚丁的远山",
    route: "丽香香亚亚亚",
    businessType: "私享管家",
    emotionalNeeds: ["专属尊享", "被照顾", "亲友高质量陪伴", "探索与成长", "逃离与疗愈"],
    travelCompanions: ["夫妻/情侣", "带朋友"],
    preferencePrimary: ["自然景观"],
    preferenceSecondary: ["深度户外"],
    altitudeExperience: ["无高原经验", "有高原经验"],
    travelNode: ["根据系统维护的实际数据进行匹配"],
    budget: [],
    destinationIntent: [],
    duration: [],
  },
  {
    id: "product-002",
    series: "基本盘",
    name: "亚丁的远山",
    route: "丽香香亚亚亚",
    businessType: "主题团",
    emotionalNeeds: ["社交与联结", "探索与成长", "逃离与疗愈"],
    travelCompanions: ["自己", "夫妻/情侣", "带朋友"],
    preferencePrimary: ["自然景观"],
    preferenceSecondary: ["深度户外"],
    altitudeExperience: ["无高原经验", "有高原经验"],
    travelNode: [],
    budget: [],
    destinationIntent: [],
    duration: [],
  },
  {
    id: "product-004",
    series: "基本盘",
    name: "初探亚丁三神山",
    route: "丽香亚亚香",
    businessType: "自由行",
    emotionalNeeds: ["亲友高质量陪伴", "逃离与疗愈"],
    travelCompanions: ["夫妻/情侣", "带朋友"],
    preferencePrimary: ["自然景观"],
    preferenceSecondary: ["深度户外", "轻户外"],
    altitudeExperience: ["无高原经验", "有高原经验"],
    travelNode: [],
    budget: [],
    destinationIntent: ["亚丁"],
    duration: ["5-7晚"],
  },
  {
    id: "product-005",
    series: "珍贵风物",
    name: "寻味滇西北",
    route: "丽丽塔塔香香",
    businessType: "私享管家",
    emotionalNeeds: ["专属尊享", "被照顾", "亲子陪伴与成长", "亲友高质量陪伴", "探索与成长"],
    travelCompanions: ["夫妻/情侣", "带朋友", "银发族", "带父母", "带孩子", "家庭出行"],
    preferencePrimary: ["美食美酒/寻找珍贵风物"],
    preferenceSecondary: ["度假休闲"],
    altitudeExperience: ["无高原经验", "有高原经验"],
    travelNode: [],
    budget: ["3万+/人"],
    destinationIntent: ["滇西北"],
    duration: [],
  },
];

const defaultWeightScenarios: MatchingWeightScenario[] = [
  {
    id: "scenario-default",
    name: "通用",
    trigger: "默认场景",
    triggerTags: [],
    weights: { emotion: 10, travelNode: 15, companions: 5, budget: 10, duration: 10, preference: 25, destination: 20, altitude: 5 },
  },
  {
    id: "scenario-family",
    name: "细分：出行组合 - 带孩子、带父母、家庭出行、银发族",
    trigger: "出行组合包含家庭/长辈/孩子标签",
    triggerTags: ["带孩子", "带父母", "家庭出行", "银发族"],
    weights: { emotion: 10, travelNode: 5, companions: 25, budget: 10, duration: 5, preference: 20, destination: 10, altitude: 15 },
  },
  {
    id: "scenario-preference",
    name: "细分：出行偏好 - 珍贵风物、马背上的松赞、低空旅行、深度文化体验",
    trigger: "出行偏好包含主题产品主标签",
    triggerTags: ["美食美酒/寻找珍贵风物", "马背上的松赞", "低空旅行", "深度文化体验"],
    weights: { emotion: 15, travelNode: 10, companions: 5, budget: 5, duration: 5, preference: 30, destination: 20, altitude: 10 },
  },
  {
    id: "scenario-budget",
    name: "细分：预算 - 1-2万/人",
    trigger: "预算标签为 1-2万/人",
    triggerTags: ["1-2万/人"],
    weights: { emotion: 5, travelNode: 15, companions: 5, budget: 20, duration: 20, preference: 10, destination: 15, altitude: 10 },
  },
];

const adminModules: Record<AdminMenuKey, AdminModule> = {
  overview: {
    title: "用户关系助手后台",
    description: "统一管理企微侧边栏、销售沟通流程、标签体系、推荐规则和客史数据展示。",
    metrics: [
      { label: "前台菜单", value: "4", trend: "客户画像 / 我的待办 / 客史信息 / 用户关系助手" },
      { label: "流程阶段", value: "4", trend: "沟通前到沟通记录全链路" },
      { label: "标签维度", value: "8", trend: "与 Sheet1 标签词典一致" },
      { label: "规则模块", value: "7", trend: "当前全部启用" },
    ],
    sections: [
      { title: "当前发布", items: ["用户关系助手", "客户画像", "我的待办", "客史信息"] },
      { title: "配置重点", items: ["沟通前标签预判", "沟通中话术与标签", "需求确认提醒", "沟通记录转化链路"] },
    ],
    table: [
      { name: "企微侧边栏菜单", owner: "运营配置", status: "已发布", updatedAt: "2026-06-18 15:10" },
      { name: "销售沟通业务流", owner: "销售运营", status: "已发布", updatedAt: "2026-06-18 15:18" },
      { name: "后台权限与入口", owner: "系统管理", status: "草稿", updatedAt: "2026-06-18 15:25" },
    ],
  },
  tags: {
    title: "标签词典管理",
    description: "维护 Sheet1 标签词典中的维度、枚举、单选/多选规则，并同步到沟通前和沟通中。",
    metrics: [
      { label: "维度", value: "8", trend: "情感需求、旅行节点等" },
      { label: "枚举", value: "90+", trend: "支持批量导入" },
      { label: "单选维度", value: "2", trend: "出行组合、高原经验" },
      { label: "启用端", value: "2", trend: "沟通前与沟通中共用" },
    ],
    sections: [
      { title: "核心维度", items: ["情感需求", "旅行节点", "出行组合", "预算"] },
      { title: "扩展维度", items: ["出行天数", "出行偏好", "意向目的地", "高原经验"] },
    ],
    table: [
      { name: "A. 情感需求", owner: "标签运营", status: "启用", updatedAt: "2026-06-18 14:20" },
      { name: "B. 旅行节点", owner: "产品运营", status: "启用", updatedAt: "2026-06-18 14:22" },
      { name: "H. 高原经验", owner: "销售运营", status: "启用", updatedAt: "2026-06-18 14:26" },
    ],
  },
  flow: {
    title: "沟通流程配置",
    description: "配置销售端四个阶段、客户状态判断、推荐沟通路径和沟通问题树。",
    metrics: [
      { label: "阶段", value: "4", trend: "沟通前 / 沟通中 / 需求确认 / 沟通记录" },
      { label: "状态", value: "3", trend: "关系维护、需求培育、成交推进" },
      { label: "路径", value: "3", trend: "按客户状态自动切换" },
      { label: "话术节点", value: "23", trend: "折叠展示" },
    ],
    sections: [
      { title: "阶段管理", items: ["沟通前", "沟通中", "需求确认", "沟通记录"] },
      { title: "问题树", items: ["出行时间", "出行人数", "预算范围", "出行偏好", "产品匹配", "成交推进"] },
    ],
    table: [
      { name: "客户状态快速判断", owner: "销售运营", status: "启用", updatedAt: "2026-06-18 13:48" },
      { name: "推荐沟通路径", owner: "销售运营", status: "启用", updatedAt: "2026-06-18 13:52" },
      { name: "沟通问题树", owner: "培训团队", status: "待复核", updatedAt: "2026-06-18 13:58" },
    ],
  },
  matching: {
    title: "产品匹配规则",
    description: "管理需求标签到产品标签的映射、推荐排序、禁推规则和业务类型展示。",
    metrics: [
      { label: "产品标签", value: "48", trend: "来自产品库" },
      { label: "映射规则", value: "36", trend: "需求标签到产品标签" },
      { label: "禁推规则", value: "6", trend: "高反、低龄、长车程等" },
      { label: "业务类型", value: "4", trend: "主题团、自由行、私享管家、私人定制" },
    ],
    sections: [
      { title: "推荐输入", items: ["沟通前预判标签", "沟通中结果标签", "客户画像标签", "历史订单偏好"] },
      { title: "输出内容", items: ["推荐产品列表", "命中标签", "不适合说明", "报价候选"] },
    ],
    table: [
      { name: "亲子陪伴 -> 亲子自然探索", owner: "产品运营", status: "启用", updatedAt: "2026-06-18 12:30" },
      { name: "怕高反 -> 降低徒步推荐", owner: "销售运营", status: "启用", updatedAt: "2026-06-18 12:36" },
      { name: "雪山季 -> 梅里/亚丁产品", owner: "产品运营", status: "启用", updatedAt: "2026-06-18 12:42" },
    ],
  },
  profile: {
    title: "客户画像字段",
    description: "配置客户画像和客史信息中的会员属性、消费属性、偏好字段和记录展示。",
    metrics: [
      { label: "画像分组", value: "6", trend: "会员、家庭、消费、行为等" },
      { label: "客史字段", value: "12", trend: "会员属性到消费人数" },
      { label: "偏好字段", value: "3", trend: "饮食、住宿、鞋码" },
      { label: "记录类型", value: "4", trend: "订单、活动、投诉、维护" },
    ],
    sections: [
      { title: "会员与消费", items: ["会员属性", "客户属性", "消费属性", "本年消费频次"] },
      { title: "偏好与记录", items: ["饮食偏好", "住宿偏好", "鞋码", "订单记录", "线下活动记录", "投诉记录"] },
    ],
    table: [
      { name: "会员基础属性", owner: "CRM运营", status: "启用", updatedAt: "2026-06-18 11:10" },
      { name: "会员偏好", owner: "服务运营", status: "启用", updatedAt: "2026-06-18 11:16" },
      { name: "客史记录展示", owner: "CRM运营", status: "启用", updatedAt: "2026-06-18 11:22" },
    ],
  },
  reminders: {
    title: "提醒待办规则",
    description: "维护需求确认后的提醒时间、提醒内容、待办触发和企微侧边栏提示。",
    metrics: [
      { label: "提醒模板", value: "12", trend: "按业务场景配置" },
      { label: "触发场景", value: "5", trend: "报价后、出行前、到店等" },
      { label: "待办类型", value: "5", trend: "维护、风险、到店、业绩、线索" },
      { label: "启用", value: "9", trend: "其余待审核" },
    ],
    sections: [
      { title: "提醒来源", items: ["需求确认", "报价后未反馈", "出行前风险", "VIP到店", "集团线索"] },
      { title: "提醒内容", items: ["提醒时间", "提醒内容", "客户上下文", "下一步建议"] },
    ],
    table: [
      { name: "需求确认提醒", owner: "销售运营", status: "启用", updatedAt: "2026-06-18 10:50" },
      { name: "报价后未反馈", owner: "销售运营", status: "启用", updatedAt: "2026-06-18 10:54" },
      { name: "VIP到店交接", owner: "服务运营", status: "启用", updatedAt: "2026-06-18 10:58" },
    ],
  },
  records: {
    title: "沟通记录与转化",
    description: "管理多轮沟通记录、销售推荐产品演化链路和订单转化结果。",
    metrics: [
      { label: "记录模板", value: "6", trend: "沟通、标签、推荐、原话等" },
      { label: "转化字段", value: "5", trend: "订单 ID、产品、类型、标签、金额" },
      { label: "链路类型", value: "2", trend: "推荐链路与成交链路" },
      { label: "保留周期", value: "长期", trend: "随客户客史沉淀" },
    ],
    sections: [
      { title: "沟通记录", items: ["本次沟通", "标签变化", "推荐产品", "客户原话", "下次待办"] },
      { title: "转化链路", items: ["订单ID", "产品名称", "订单类型", "产品标签", "订单金额"] },
    ],
    table: [
      { name: "多轮沟通记录", owner: "销售运营", status: "启用", updatedAt: "2026-06-18 10:12" },
      { name: "推荐产品演化", owner: "产品运营", status: "启用", updatedAt: "2026-06-18 10:18" },
      { name: "完成转化卡片", owner: "CRM运营", status: "启用", updatedAt: "2026-06-18 10:24" },
    ],
  },
};

export function AdminManagementEntry({ onOpen }: { onOpen: () => void }) {
  return (
    <aside className="sticky top-12 hidden w-[380px] pt-12 xl:block" aria-label="后台管理入口">
      <div className="rounded-[18px] border border-dashed border-copper/45 bg-white/35 p-4">
        <div className="rounded-[16px] border border-snow bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-copper text-white">
              <MonitorCog size={22} />
            </span>
            <div>
              <p className="text-xs font-semibold leading-5 text-clay/55">后台管理</p>
              <h2 className="mt-1 text-xl font-semibold leading-7 text-cedar">用户关系助手管理台</h2>
              <p className="mt-2 text-sm leading-6 text-clay/65">进入 PC 后台配置标签、话术、推荐规则、画像字段、提醒和沟通记录。</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpen}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-[8px] bg-copper px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-copper/90"
          >
            <MonitorCog size={17} />
            进入后台管理
          </button>
        </div>
      </div>
    </aside>
  );
}

function ConfigChip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-[6px] bg-slate-100 px-2.5 py-1 text-xs leading-5 text-clay">
      {label}
      {onRemove && (
        <button type="button" onClick={onRemove} className="text-clay/45 hover:text-copper" aria-label={`移除${label}`}>
          ×
        </button>
      )}
    </span>
  );
}

function ProductMatchingWorkbench() {
  const [activeTab, setActiveTab] = useState<"matrix" | "weights">("matrix");
  const [keyword, setKeyword] = useState("");
  const [matrixRows, setMatrixRows] = useState<ProductMatrixRow[]>(defaultProductMatrixRows);
  const [scenarios, setScenarios] = useState<MatchingWeightScenario[]>(defaultWeightScenarios);

  const filteredRows = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return matrixRows;
    return matrixRows.filter((row) => `${row.series} ${row.name} ${row.route} ${row.businessType}`.toLowerCase().includes(normalized));
  }, [keyword, matrixRows]);

  function removeProductTag(productId: string, field: ProductTagField, tag: string) {
    setMatrixRows((current) =>
      current.map((row) =>
        row.id === productId
          ? {
              ...row,
              [field]: row[field].filter((item) => item !== tag),
            }
          : row,
      ),
    );
  }

  function updateScenarioWeight(scenarioId: string, dimension: string, value: string) {
    const nextValue = Math.max(0, Number(value) || 0);
    setScenarios((current) =>
      current.map((scenario) =>
        scenario.id === scenarioId
          ? {
              ...scenario,
              weights: { ...scenario.weights, [dimension]: nextValue },
            }
          : scenario,
      ),
    );
  }

  return (
    <section className="mt-6 rounded-[10px] border border-snow bg-white shadow-sm">
      <div className="flex items-start justify-between border-b border-snow px-5 py-5">
        <div>
          <h3 className="text-lg font-semibold leading-7 text-cedar">配置工作台</h3>
          <p className="mt-1 text-sm leading-6 text-clay/55">产品打标矩阵与细分权重配置，保存后用于销售端需求标签匹配产品。</p>
        </div>
        <span className="rounded-full bg-linen px-3 py-1 text-xs font-semibold text-clay">参考：需求标签映射验证工具</span>
      </div>

      <div className="border-b border-snow px-5">
        <div className="flex gap-7">
          {[
            { key: "matrix", label: "产品标签矩阵" },
            { key: "weights", label: "细分权重场景" },
          ].map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as "matrix" | "weights")}
                className={`border-b-2 px-0 py-4 text-sm font-semibold transition ${
                  active ? "border-blue-500 text-blue-600" : "border-transparent text-clay/65 hover:text-cedar"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "matrix" ? (
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <label className="flex h-11 w-[360px] items-center gap-2 rounded-[8px] border border-snow bg-white px-3 text-sm text-clay/55">
                <Search size={17} />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent outline-none"
                  placeholder="搜索产品名称、系列、路线、业务类型"
                />
              </label>
              <span className="text-xs leading-5 text-clay/50">当前显示 {filteredRows.length} 个产品配置行</span>
            </div>
            <button type="button" className="rounded-[8px] bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">
              保存产品标签矩阵
            </button>
          </div>

          <div className="overflow-x-auto rounded-[10px] border border-snow">
            <table className="min-w-[1480px] border-collapse text-left text-sm">
              <thead className="bg-linen text-xs font-semibold text-cedar">
                <tr>
                  <th className="w-[110px] border-r border-snow px-4 py-3">产品系列</th>
                  <th className="w-[190px] border-r border-snow px-4 py-3">产品名称</th>
                  <th className="w-[150px] border-r border-snow px-4 py-3">路线</th>
                  <th className="w-[120px] border-r border-snow px-4 py-3">业务类型</th>
                  {productMatrixFields.map((field) => (
                    <th key={field.key} className="min-w-[220px] border-r border-snow px-4 py-3">
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-snow bg-white">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="align-top">
                    <td className="border-r border-snow px-4 py-4">
                      <span className="rounded-[6px] bg-slate-100 px-2.5 py-1 text-xs text-clay">{row.series}</span>
                    </td>
                    <td className="border-r border-snow px-4 py-4 font-semibold text-cedar">{row.name}</td>
                    <td className="border-r border-snow px-4 py-4 text-clay/65">{row.route}</td>
                    <td className="border-r border-snow px-4 py-4">
                      <span className="rounded-[6px] bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">{row.businessType}</span>
                    </td>
                    {productMatrixFields.map((field) => (
                      <td key={`${row.id}-${field.key}`} className="border-r border-snow px-3 py-3">
                        <div className="min-h-11 rounded-[8px] border border-snow bg-white px-2 py-2">
                          <div className="flex flex-wrap gap-1.5">
                            {row[field.key].length ? (
                              row[field.key].map((tag) => (
                                <ConfigChip
                                  key={`${row.id}-${field.key}-${tag}`}
                                  label={tag}
                                  onRemove={() => removeProductTag(row.id, field.key, tag)}
                                />
                              ))
                            ) : (
                              <span className="text-xs leading-5 text-clay/35">未配置</span>
                            )}
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="text-base font-semibold leading-6 text-cedar">细分权重场景</h4>
              <p className="mt-1 text-xs leading-5 text-clay/55">命中触发标签后，覆盖通用维度权重，用于细分推荐排序。</p>
            </div>
            <button type="button" className="rounded-[8px] bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">
              保存细分权重场景
            </button>
          </div>

          <div className="space-y-4">
            {scenarios.map((scenario) => (
              <section key={scenario.id} className="rounded-[10px] border border-snow bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h5 className="text-sm font-semibold leading-6 text-cedar">{scenario.name}</h5>
                    <p className="mt-1 text-xs leading-5 text-clay/55">{scenario.trigger}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {scenario.triggerTags.length ? scenario.triggerTags.map((tag) => <ConfigChip key={`${scenario.id}-${tag}`} label={tag} />) : <ConfigChip label="默认场景" />}
                    </div>
                  </div>
                  <span className="rounded-full bg-sage/12 px-3 py-1 text-xs font-semibold text-sage">启用</span>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {weightDimensions.map((dimension) => (
                    <label key={`${scenario.id}-${dimension.key}`} className="rounded-[8px] border border-snow bg-linen px-3 py-2">
                      <span className="block text-xs leading-5 text-clay/55">{dimension.label}</span>
                      <input
                        type="number"
                        min={0}
                        value={scenario.weights[dimension.key] ?? 0}
                        onChange={(event) => updateScenarioWeight(scenario.id, dimension.key, event.target.value)}
                        className="mt-1 w-full bg-transparent text-lg font-semibold leading-7 text-cedar outline-none"
                      />
                    </label>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function AdminManagementPage({ onBack }: { onBack: () => void }) {
  const [activeAdminMenu, setActiveAdminMenu] = useState<AdminMenuKey>("overview");
  const activeItem = adminMenus.find((item) => item.key === activeAdminMenu) ?? adminMenus[0];
  const ActiveIcon = activeItem.icon;
  const activeModule = adminModules[activeAdminMenu];

  return (
    <main className="min-h-screen bg-[#eef2f6] text-cedar">
      <div className="flex min-h-screen min-w-[1180px]">
        <aside className="w-[264px] shrink-0 border-r border-snow bg-copper px-4 py-5 text-white">
          <div className="flex items-center gap-3 px-2">
            <span className="grid h-11 w-11 place-items-center rounded-[10px] bg-white/10">
              <MonitorCog size={22} />
            </span>
            <div>
              <p className="text-sm font-semibold leading-5">松赞 CRM</p>
              <p className="text-xs leading-5 text-white/55">后台管理端</p>
            </div>
          </div>

          <nav className="mt-7 space-y-1" aria-label="后台管理菜单">
            {adminMenus.map((item) => {
              const Icon = item.icon;
              const active = item.key === activeAdminMenu;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveAdminMenu(item.key)}
                  className={`flex w-full items-center gap-3 rounded-[8px] px-3 py-3 text-left transition ${
                    active ? "bg-white text-copper shadow-sm" : "text-white/68 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>
                    <span className="block text-sm font-semibold leading-5">{item.label}</span>
                    <span className={`block text-[11px] leading-4 ${active ? "text-clay/55" : "text-white/42"}`}>{item.description}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-snow bg-white/92 px-8 backdrop-blur">
            <div>
              <p className="text-xs font-semibold leading-5 text-copper">PC 后台配置</p>
              <h1 className="text-lg font-semibold leading-6 text-cedar">用户关系助手管理台</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden w-[300px] items-center gap-2 rounded-[8px] border border-snow bg-linen px-3 py-2 text-sm text-clay/55 lg:flex">
                <Search size={16} />
                搜索配置项、标签、话术
              </div>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-[8px] border border-snow bg-white px-4 py-2 text-sm font-semibold text-cedar shadow-sm transition hover:border-copper/35 hover:bg-linen"
              >
                <ArrowLeft size={16} />
                返回企微演示
              </button>
            </div>
          </header>

          <div className="px-8 py-7">
            <section className="rounded-[10px] border border-snow bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[10px] bg-copper text-white">
                    <ActiveIcon size={23} />
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold leading-8 text-cedar">{activeModule.title}</h2>
                    <p className="mt-2 max-w-[760px] text-sm leading-6 text-clay/65">{activeModule.description}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/12 px-3 py-1.5 text-xs font-semibold text-sage">
                  <CheckCircle2 size={14} />
                  已保存
                </span>
              </div>

              <div className="mt-6 grid grid-cols-4 gap-4">
                {activeModule.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-[10px] border border-snow bg-linen p-4">
                    <p className="text-xs font-medium leading-5 text-clay/55">{metric.label}</p>
                    <p className="mt-1 text-2xl font-semibold leading-8 text-cedar">{metric.value}</p>
                    <p className="mt-2 text-xs leading-5 text-clay/55">{metric.trend}</p>
                  </div>
                ))}
              </div>
            </section>

            {activeAdminMenu === "matching" ? (
              <ProductMatchingWorkbench />
            ) : (
              <div className="mt-6 grid grid-cols-[minmax(0,1fr)_360px] gap-6">
                <section className="rounded-[10px] border border-snow bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold leading-6 text-cedar">配置项列表</h3>
                      <p className="mt-1 text-xs leading-5 text-clay/55">运营在这里维护当前模块的字段、规则和发布状态。</p>
                    </div>
                    <button className="rounded-[8px] bg-copper px-4 py-2 text-sm font-semibold text-white" type="button">新增配置</button>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-[10px] border border-snow">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead className="bg-linen text-xs font-semibold text-clay/55">
                        <tr>
                          <th className="px-4 py-3">配置名称</th>
                          <th className="px-4 py-3">负责人</th>
                          <th className="px-4 py-3">状态</th>
                          <th className="px-4 py-3">更新时间</th>
                          <th className="px-4 py-3 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-snow bg-white">
                        {activeModule.table.map((row) => (
                          <tr key={`${row.name}-${row.updatedAt}`}>
                            <td className="px-4 py-4 font-medium text-cedar">{row.name}</td>
                            <td className="px-4 py-4 text-clay/65">{row.owner}</td>
                            <td className="px-4 py-4">
                              <span className="rounded-full bg-sage/12 px-2.5 py-1 text-xs font-semibold text-sage">{row.status}</span>
                            </td>
                            <td className="px-4 py-4 text-clay/55">{row.updatedAt}</td>
                            <td className="px-4 py-4 text-right text-sm font-semibold text-copper">编辑</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <aside className="space-y-6">
                  <section className="rounded-[10px] border border-snow bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Settings2 size={18} className="text-copper" />
                      <h3 className="text-base font-semibold leading-6 text-cedar">模块结构</h3>
                    </div>
                    <div className="mt-4 space-y-4">
                      {activeModule.sections.map((section) => (
                        <div key={section.title}>
                          <p className="text-xs font-semibold leading-5 text-copper">{section.title}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {section.items.map((item) => (
                              <span key={item} className="rounded-full bg-slate-50 px-3 py-1.5 text-xs leading-5 text-clay ring-1 ring-snow">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-[10px] border border-snow bg-copper p-5 text-white shadow-sm">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} />
                      <h3 className="text-base font-semibold leading-6">发布控制</h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/70">配置保存后先进入草稿，运营复核后再发布到销售端，避免未确认的话术、标签或规则直接影响一线使用。</p>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs font-semibold">
                      <button type="button" className="rounded-[8px] bg-white px-3 py-2 text-copper">保存草稿</button>
                      <button type="button" className="rounded-[8px] bg-white/10 px-3 py-2 text-white ring-1 ring-white/20">发布配置</button>
                    </div>
                  </section>
                </aside>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
