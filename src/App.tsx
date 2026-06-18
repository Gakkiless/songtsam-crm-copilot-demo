import { ClipboardList, History, MessageSquareText, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import AdminManagementPage, { AdminManagementEntry } from "./components/AdminManagementPanel";
import ChatPanel, { type SidebarMenuKey } from "./components/ChatPanel";

const demoMenus: Array<{
  key: SidebarMenuKey;
  label: string;
  description: string;
  icon: typeof UserRound;
}> = [
  { key: "profile", label: "客户画像", description: "客户标签与画像摘要", icon: UserRound },
  { key: "todo", label: "我的待办", description: "跟进提醒与待办任务", icon: ClipboardList },
  { key: "history", label: "客史信息", description: "会员、消费和记录", icon: History },
  { key: "assistant", label: "用户关系助手", description: "销售沟通业务流", icon: MessageSquareText },
];

export default function App() {
  const [activeMenu, setActiveMenu] = useState<SidebarMenuKey>("assistant");
  const [route, setRoute] = useState(() => (window.location.hash === "#/admin" ? "admin" : "demo"));

  useEffect(() => {
    const syncRoute = () => setRoute(window.location.hash === "#/admin" ? "admin" : "demo");
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  if (window.location.pathname === "/demo-v2" || window.location.pathname === "/communication-demo") {
    window.location.replace("/");
    return null;
  }

  function openAdminPage() {
    window.location.hash = "/admin";
    setRoute("admin");
  }

  function backToDemo() {
    window.location.hash = "/";
    setRoute("demo");
  }

  if (route === "admin") {
    return <AdminManagementPage onBack={backToDemo} />;
  }

  return (
    <main className="min-h-screen bg-[#eef2f6] text-cedar">
      <div className="mx-auto flex min-h-screen w-full max-w-[1180px] items-start justify-center gap-14 px-6">
        <div className="min-h-screen w-full max-w-[430px] bg-linen shadow-[0_24px_90px_rgba(15,23,42,0.10)]">
          <ChatPanel activeMenu={activeMenu} />
        </div>
        <aside className="sticky top-12 hidden w-[300px] pt-12 lg:block" aria-label="企微侧边栏菜单演示">
          <div className="rounded-[18px] border border-dashed border-copper/45 bg-white/35 p-4">
            <p className="px-1 text-xs font-semibold leading-5 text-clay/60">企微侧边栏菜单演示</p>
            <div className="mt-3 space-y-3">
              {demoMenus.map((item) => {
                const Icon = item.icon;
                const active = activeMenu === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveMenu(item.key)}
                    className={`flex w-full items-center gap-3 rounded-[8px] border px-4 py-4 text-left shadow-sm transition ${
                      active
                        ? "border-copper bg-copper text-white"
                        : "border-snow bg-white text-cedar hover:border-copper/40 hover:bg-linen"
                    }`}
                  >
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-[8px] ${active ? "bg-white/12" : "bg-linen text-copper"}`}>
                      <Icon size={19} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-base font-semibold leading-6">{item.label}</span>
                      <span className={`mt-0.5 block text-xs leading-5 ${active ? "text-white/70" : "text-clay/55"}`}>
                        {item.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
        <AdminManagementEntry onOpen={openAdminPage} />
      </div>
    </main>
  );
}
