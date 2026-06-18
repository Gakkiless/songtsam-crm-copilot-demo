import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookOpenText,
  Boxes,
  Database,
  GitBranch,
  LayoutDashboard,
  ListTree,
  Tags,
  UserCog,
} from "lucide-react";
import { useState } from "react";

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
  metrics: Array<{ label: string; value: string }>;
  sections: Array<{ title: string; items: string[] }>;
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

const adminModules: Record<AdminMenuKey, AdminModule> = {
  overview: {
    title: "用户关系助手后台",
    description: "统一管理企微侧边栏、销售沟通流程、标签体系、推荐规则和客史数据展示。",
    metrics: [
      { label: "前台菜单", value: "4" },
      { label: "流程阶段", value: "4" },
      { label: "标签维度", value: "8" },
      { label: "规则模块", value: "7" },
    ],
    sections: [
      { title: "当前发布", items: ["用户关系助手", "客户画像", "我的待办", "客史信息"] },
      { title: "配置重点", items: ["沟通前标签预判", "沟通中话术与标签", "需求确认提醒", "沟通记录转化链路"] },
    ],
  },
  tags: {
    title: "标签词典管理",
    description: "维护 Sheet1 标签词典中的维度、枚举、单选/多选规则，并同步到沟通前和沟通中。",
    metrics: [
      { label: "维度", value: "8" },
      { label: "枚举", value: "90+" },
      { label: "单选维度", value: "2" },
      { label: "启用端", value: "2" },
    ],
    sections: [
      { title: "核心维度", items: ["情感需求", "旅行节点", "出行组合", "预算"] },
      { title: "扩展维度", items: ["出行天数", "出行偏好", "意向目的地", "高原经验"] },
    ],
  },
  flow: {
    title: "沟通流程配置",
    description: "配置销售端四个阶段、客户状态判断、推荐沟通路径和沟通问题树。",
    metrics: [
      { label: "阶段", value: "4" },
      { label: "状态", value: "3" },
      { label: "路径", value: "3" },
      { label: "话术节点", value: "23" },
    ],
    sections: [
      { title: "阶段管理", items: ["沟通前", "沟通中", "需求确认", "沟通记录"] },
      { title: "问题树", items: ["出行时间", "出行人数", "预算范围", "出行偏好", "产品匹配", "成交推进"] },
    ],
  },
  matching: {
    title: "产品匹配规则",
    description: "管理需求标签到产品标签的映射、推荐排序、禁推规则和业务类型展示。",
    metrics: [
      { label: "产品标签", value: "48" },
      { label: "映射规则", value: "36" },
      { label: "禁推规则", value: "6" },
      { label: "业务类型", value: "4" },
    ],
    sections: [
      { title: "推荐输入", items: ["沟通前预判标签", "沟通中结果标签", "客户画像标签", "历史订单偏好"] },
      { title: "输出内容", items: ["推荐产品列表", "命中标签", "不适合说明", "报价候选"] },
    ],
  },
  profile: {
    title: "客户画像字段",
    description: "配置客户画像和客史信息中的会员属性、消费属性、偏好字段和记录展示。",
    metrics: [
      { label: "画像分组", value: "6" },
      { label: "客史字段", value: "12" },
      { label: "偏好字段", value: "3" },
      { label: "记录类型", value: "4" },
    ],
    sections: [
      { title: "会员与消费", items: ["会员属性", "客户属性", "消费属性", "本年消费频次"] },
      { title: "偏好与记录", items: ["饮食偏好", "住宿偏好", "鞋码", "订单记录", "线下活动记录", "投诉记录"] },
    ],
  },
  reminders: {
    title: "提醒待办规则",
    description: "维护需求确认后的提醒时间、提醒内容、待办触发和企微侧边栏提示。",
    metrics: [
      { label: "提醒模板", value: "12" },
      { label: "触发场景", value: "5" },
      { label: "待办类型", value: "5" },
      { label: "启用", value: "9" },
    ],
    sections: [
      { title: "提醒来源", items: ["需求确认", "报价后未反馈", "出行前风险", "VIP到店", "集团线索"] },
      { title: "提醒内容", items: ["提醒时间", "提醒内容", "客户上下文", "下一步建议"] },
    ],
  },
  records: {
    title: "沟通记录与转化",
    description: "管理多轮沟通记录、销售推荐产品演化链路和订单转化结果。",
    metrics: [
      { label: "记录模板", value: "6" },
      { label: "转化字段", value: "5" },
      { label: "链路类型", value: "2" },
      { label: "保留周期", value: "长期" },
    ],
    sections: [
      { title: "沟通记录", items: ["本次沟通", "标签变化", "推荐产品", "客户原话", "下次待办"] },
      { title: "转化链路", items: ["订单ID", "产品名称", "订单类型", "产品标签", "订单金额"] },
    ],
  },
};

export default function AdminManagementPanel() {
  const [activeAdminMenu, setActiveAdminMenu] = useState<AdminMenuKey>("overview");
  const activeItem = adminMenus.find((item) => item.key === activeAdminMenu) ?? adminMenus[0];
  const ActiveIcon = activeItem.icon;
  const activeModule = adminModules[activeAdminMenu];

  return (
    <aside className="sticky top-12 hidden w-[380px] pt-12 xl:block" aria-label="后台管理演示">
      <div className="rounded-[18px] border border-dashed border-copper/45 bg-white/35 p-4">
        <div className="flex items-start justify-between gap-3 px-1">
          <div>
            <p className="text-xs font-semibold leading-5 text-clay/60">后台管理</p>
            <h2 className="mt-1 text-lg font-semibold leading-7 text-cedar">用户关系助手管理台</h2>
          </div>
          <span className="rounded-full bg-copper px-3 py-1 text-xs font-semibold text-white">Admin</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {adminMenus.map((item) => {
            const Icon = item.icon;
            const active = item.key === activeAdminMenu;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveAdminMenu(item.key)}
                className={`rounded-[8px] border px-3 py-3 text-left transition ${
                  active
                    ? "border-copper bg-copper text-white"
                    : "border-snow bg-white text-cedar hover:border-copper/40 hover:bg-linen"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon size={16} />
                  <span className="text-sm font-semibold leading-5">{item.label}</span>
                </span>
                <span className={`mt-1 block text-[11px] leading-4 ${active ? "text-white/65" : "text-clay/50"}`}>
                  {item.description}
                </span>
              </button>
            );
          })}
        </div>

        <section className="mt-4 rounded-[16px] border border-snow bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-linen text-copper">
              <ActiveIcon size={19} />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold leading-6 text-cedar">{activeModule.title}</h3>
              <p className="mt-1 text-xs leading-5 text-clay/60">{activeModule.description}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {activeModule.metrics.map((metric) => (
              <div key={metric.label} className="rounded-[10px] bg-linen px-2 py-2 text-center">
                <p className="text-[10px] leading-4 text-clay/50">{metric.label}</p>
                <p className="mt-0.5 text-sm font-semibold leading-5 text-cedar">{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-3">
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

          <div className="mt-4 rounded-[12px] bg-copper px-3 py-3 text-white">
            <p className="text-sm font-semibold leading-5">后台端用途</p>
            <p className="mt-1 text-xs leading-5 text-white/70">用于运营配置销售端页面、标签、话术、推荐规则和转化记录字段。</p>
          </div>
        </section>
      </div>
    </aside>
  );
}
