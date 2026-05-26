import {
  ArrowLeft,
  Bot,
  Check,
  ChevronDown,
  Copy,
  FileText,
  MessageCircle,
  Mic,
  Plus,
  Save,
  Sparkles,
} from "lucide-react";
import { Button, Card, DatePicker, Picker, Selector, Tabs, Tag, TextArea, Toast } from "antd-mobile";
import type { PickerValue } from "antd-mobile/es/components/picker";
import { useMemo, useState } from "react";
import { mockProducts } from "../data/mockProducts";
import type { Customer, Product } from "../types";

type StageKey = "pre" | "during" | "confirm" | "follow";
type FollowPlan = { time: Date; method: string; content: string };

type SalesJourneyFlowProps = {
  customer: Customer;
  onClose: () => void;
};

const stageItems: Array<{ key: StageKey; title: string }> = [
  { key: "pre", title: "预判" },
  { key: "during", title: "沟通中" },
  { key: "confirm", title: "确认" },
  { key: "follow", title: "跟进" },
];

const tagDimensions = [
  { title: "人群关系", options: ["亲子", "三代同游", "夫妻同行", "企业家", "摄影客", "银发同行"] },
  { title: "旅行偏好", options: ["慢节奏", "酒店偏好", "雪山景观", "藏文化", "自然教育", "轻徒步"] },
  { title: "风险顾虑", options: ["怕高反", "带老人", "低龄儿童", "时间敏感", "不想换酒店", "不接受长车程"] },
  { title: "行为信号", options: ["近期浏览梅里", "咨询暑期", "复购潜力", "等待报价", "预算明确", "高转化"] },
];

const communicationMethods = ["企业微信", "电话沟通", "线下面谈", "到店沟通", "会员活动", "家庭群沟通", "其他"];

const followMethods = ["企业微信", "电话回访", "线下面谈", "发送方案", "会员活动邀约", "管家协同"];

const surveyQuestions = [
  {
    id: "purpose",
    title: "这次出行的主要目的是什么？",
    options: [
      { label: "亲子陪伴", tags: ["亲子", "自然教育"], intent: "暑期亲子旅行" },
      { label: "放松度假", tags: ["慢节奏", "酒店偏好"], intent: "酒店度假" },
      { label: "看雪山", tags: ["雪山景观", "怕高反"], intent: "梅里雪山方向" },
      { label: "文化深度", tags: ["藏文化", "复购潜力"], intent: "深度文化体验" },
    ],
  },
  {
    id: "pace",
    title: "客户能接受的行程节奏？",
    options: [
      { label: "尽量轻松", tags: ["慢节奏", "不接受长车程"], intent: "低强度慢行" },
      { label: "标准节奏", tags: ["轻徒步"], intent: "标准藏地体验" },
      { label: "可以深度", tags: ["藏文化", "复购潜力"], intent: "深度定制" },
      { label: "不想换酒店", tags: ["不想换酒店", "酒店偏好"], intent: "连住型方案" },
    ],
  },
  {
    id: "risk",
    title: "客户最担心什么？",
    options: [
      { label: "高反", tags: ["怕高反"], intent: "海拔适应优先" },
      { label: "老人太累", tags: ["带老人", "慢节奏"], intent: "三代低强度" },
      { label: "孩子无聊", tags: ["亲子", "自然教育"], intent: "亲子活动强化" },
      { label: "车程太长", tags: ["不接受长车程"], intent: "短车程路线" },
    ],
  },
  {
    id: "budget",
    title: "预算和决策状态？",
    options: [
      { label: "预算8万左右", tags: ["预算明确", "高转化"], intent: "可进入报价" },
      { label: "先看方案", tags: ["咨询暑期"], intent: "先发产品内容" },
      { label: "等待家人确认", tags: ["家庭决策"], intent: "补充亲子和老人信息" },
      { label: "已接近预订", tags: ["高转化", "等待报价"], intent: "推进报价和房态" },
    ],
  },
];

export default function SalesJourneyFlow({ customer, onClose }: SalesJourneyFlowProps) {
  const [activeStage, setActiveStage] = useState<StageKey>("pre");
  const [manualTags, setManualTags] = useState(["亲子", "怕高反", "酒店偏好", "慢节奏"]);
  const [selectedProductIds, setSelectedProductIds] = useState(["meili-slow", "family-nature"]);
  const [communicationMethod, setCommunicationMethod] = useState("企业微信");
  const [answers, setAnswers] = useState<Record<string, string>>({
    purpose: "亲子陪伴",
    pace: "尽量轻松",
    risk: "高反",
  });
  const [customerQuote, setCustomerQuote] = useState("客户明确表示不喜欢连续换酒店，希望老人和孩子都轻松一点。");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [methodPickerOpen, setMethodPickerOpen] = useState(false);
  const [followPlan, setFollowPlan] = useState<FollowPlan>({
    time: new Date(2026, 4, 29, 10, 30),
    method: "企业微信",
    content: "发送梅里轻奢慢行方案，并确认老人和孩子对高反的顾虑",
  });

  const answerTags = useMemo(() => {
    const tags = surveyQuestions.flatMap((question) => {
      const selected = question.options.find((option) => option.label === answers[question.id]);
      return selected?.tags ?? [];
    });
    return Array.from(new Set(tags));
  }, [answers]);

  const mergedTags = useMemo(() => Array.from(new Set([...manualTags, ...answerTags])), [answerTags, manualTags]);
  const dynamicProducts = useMemo(() => rankProducts(mergedTags), [mergedTags]);
  const selectedProducts = useMemo(
    () => mockProducts.filter((product) => selectedProductIds.includes(product.id)),
    [selectedProductIds],
  );
  const activeStageTitle = stageItems.find((stage) => stage.key === activeStage)?.title ?? "预判";

  function toggleManualTag(tag: string) {
    setManualTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  }

  function toggleProduct(productId: string) {
    setSelectedProductIds((current) => (current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]));
  }

  function saveCurrentStage(message: string) {
    Toast.show({ content: message, position: "bottom" });
  }

  return (
    <section className="songtsam-ai min-h-screen bg-linen pb-24 text-cedar">
      <header className="sticky top-0 z-30 border-b border-snow bg-parchment/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button fill="none" className="!h-9 !w-9 !p-0 !text-copper" onClick={onClose}>
            <ArrowLeft size={19} />
          </Button>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-copper/10 text-lg font-medium text-copper">
            {customer.name.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-medium leading-6">{customer.name} · {customer.memberLevel}</h1>
              <span className="flex items-center gap-1 rounded-[4px] bg-sage/10 px-1.5 py-0.5 text-[10px] leading-4 text-sage">
                <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage" />
                AI分析
              </span>
            </div>
            <p className="truncate text-xs leading-[18px] text-[#808080]">
              {customer.memberCardNo} · {activeStageTitle}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <Tabs activeKey={activeStage} onChange={(key) => setActiveStage(key as StageKey)}>
            {stageItems.map((stage) => (
              <Tabs.Tab key={stage.key} title={stage.title} />
            ))}
          </Tabs>
        </div>
      </header>

      <main className="space-y-4 px-4 py-4">
        {activeStage === "pre" && (
          <PreBriefStage
            customer={customer}
            manualTags={manualTags}
            toggleManualTag={toggleManualTag}
            selectedProductIds={selectedProductIds}
            toggleProduct={toggleProduct}
          />
        )}
        {activeStage === "during" && (
          <DuringStage
            customer={customer}
            communicationMethod={communicationMethod}
            setCommunicationMethod={setCommunicationMethod}
            answers={answers}
            setAnswers={setAnswers}
            mergedTags={mergedTags}
            customerQuote={customerQuote}
            setCustomerQuote={setCustomerQuote}
            dynamicProducts={dynamicProducts}
          />
        )}
        {activeStage === "confirm" && (
          <ConfirmStage
            customer={customer}
            tags={mergedTags}
            selectedProducts={selectedProducts.length ? selectedProducts : dynamicProducts.slice(0, 2)}
            followPlan={followPlan}
            setFollowPlan={setFollowPlan}
            datePickerOpen={datePickerOpen}
            setDatePickerOpen={setDatePickerOpen}
            methodPickerOpen={methodPickerOpen}
            setMethodPickerOpen={setMethodPickerOpen}
          />
        )}
        {activeStage === "follow" && (
          <FollowStage
            customer={customer}
            tags={mergedTags}
            answers={answers}
            selectedProducts={selectedProducts.length ? selectedProducts : dynamicProducts.slice(0, 2)}
            customerQuote={customerQuote}
            followPlan={followPlan}
            communicationMethod={communicationMethod}
          />
        )}
      </main>

      <JourneyActionBar
        activeStage={activeStage}
        setActiveStage={setActiveStage}
        onSave={() => saveCurrentStage(activeStage === "pre" ? "已保存初步预判" : "已保存本次沟通")}
      />
    </section>
  );
}

function PreBriefStage({
  customer,
  manualTags,
  toggleManualTag,
  selectedProductIds,
  toggleProduct,
}: {
  customer: Customer;
  manualTags: string[];
  toggleManualTag: (tag: string) => void;
  selectedProductIds: string[];
  toggleProduct: (id: string) => void;
}) {
  return (
    <>
      <Card className="songtsam-mobile-card">
        <SectionTitle eyebrow="客户基础信息" title="客户画像与近期行为" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <MiniInfo label="城市" value={customer.city} />
          <MiniInfo label="会员等级" value={customer.memberLevel} />
          <MiniInfo label="家庭结构" value={customer.family} wide />
          <MiniInfo label="历史消费" value={`￥${customer.gmv}`} />
          <MiniInfo label="最近出行" value={customer.lastTrip} />
          <MiniInfo label="最近浏览" value="梅里雪山亲子线、香格里拉林卡、暑期自然教育内容" wide />
          <MiniInfo label="最近咨询" value="老人孩子同行是否适合梅里，是否需要频繁换酒店" wide />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {customer.tags.map((tag) => (
            <Tag key={tag} color="default" className="!rounded-[4px]">{tag}</Tag>
          ))}
        </div>
      </Card>

      <Card className="songtsam-warm-card">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-copper" />
          <h2 className="text-lg font-medium">AI需求预判</h2>
        </div>
        <p className="mt-3 text-sm leading-[24px] text-clay/85">
          AI判断客户属于高净值家庭型用户，本次大概率是暑期三代家庭旅行。沟通重点应放在酒店体验、车程节奏、孩子自然教育和海拔适应，不要一开始推荐高强度徒步。
        </p>
        <div className="mt-3 space-y-2">
          <InsightLine label="可能出行目的" value="暑期家庭陪伴、雪山景观、孩子自然教育。" />
          <InsightLine label="风险点" value="带老人、担心高反、不希望连续换酒店。" />
          <InsightLine label="推荐策略" value="先确认同行人和节奏，再用梅里轻奢慢行作为主线切入。" />
        </div>
      </Card>

      <Card className="songtsam-mobile-card">
        <SectionTitle eyebrow="销售手动打标签" title="按维度确认初步判断" />
        <div className="mt-3 space-y-4">
          {tagDimensions.map((group) => (
            <div key={group.title}>
              <p className="mb-2 text-xs text-[#808080]">{group.title}</p>
              <Selector
                multiple
                showCheckMark={false}
                value={manualTags.filter((tag) => group.options.includes(tag))}
                options={group.options.map((tag) => ({ label: tag, value: tag }))}
                onChange={(values) => {
                  const nextGroupValues = values.map(String);
                  const otherTags = manualTags.filter((tag) => !group.options.includes(tag));
                  nextGroupValues.forEach((tag) => {
                    if (!otherTags.includes(tag)) otherTags.push(tag);
                  });
                  group.options.forEach((tag) => {
                    const shouldHave = nextGroupValues.includes(tag);
                    const has = manualTags.includes(tag);
                    if (shouldHave !== has) toggleManualTag(tag);
                  });
                }}
              />
            </div>
          ))}
        </div>
      </Card>

      <section>
        <SectionTitle eyebrow="初步推荐产品" title="选择销售认可的推荐方向" />
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1 no-scrollbar">
          {mockProducts.slice(0, 4).map((product) => (
            <SelectableProductCard
              key={product.id}
              product={product}
              selected={selectedProductIds.includes(product.id)}
              onClick={() => toggleProduct(product.id)}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function DuringStage({
  customer,
  communicationMethod,
  setCommunicationMethod,
  answers,
  setAnswers,
  mergedTags,
  customerQuote,
  setCustomerQuote,
  dynamicProducts,
}: {
  customer: Customer;
  communicationMethod: string;
  setCommunicationMethod: (method: string) => void;
  answers: Record<string, string>;
  setAnswers: (answers: Record<string, string>) => void;
  mergedTags: string[];
  customerQuote: string;
  setCustomerQuote: (value: string) => void;
  dynamicProducts: Product[];
}) {
  return (
    <>
      <Card className="songtsam-mobile-card">
        <SectionTitle eyebrow="沟通方式" title="销售手动选择本次触达方式" />
        <div className="mt-3">
          <Selector
            showCheckMark={false}
            value={[communicationMethod]}
            options={communicationMethods.map((method) => ({ label: method, value: method }))}
            onChange={(value) => setCommunicationMethod(String(value[0] ?? communicationMethod))}
          />
        </div>
      </Card>

      <Card className="songtsam-mobile-card">
        <SectionTitle eyebrow="需求挖掘问卷" title="根据客户回答动态更新画像" />
        <div className="mt-3 space-y-5">
          {surveyQuestions.map((question) => (
            <div key={question.id}>
              <p className="mb-2 text-sm font-medium leading-5">{question.title}</p>
              <Selector
                showCheckMark={false}
                value={answers[question.id] ? [answers[question.id]] : []}
                options={question.options.map((option) => ({ label: option.label, value: option.label }))}
                onChange={(value) => setAnswers({ ...answers, [question.id]: String(value[0] ?? "") })}
              />
              {answers[question.id] && (
                <p className="mt-2 rounded-[6px] bg-copper/10 px-2 py-1.5 text-xs leading-[18px] text-copper">
                  AI已匹配：{question.options.find((option) => option.label === answers[question.id])?.intent}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="songtsam-mobile-card">
        <SectionTitle eyebrow="客户真实原话" title="保留长期画像依据" />
        <div className="mt-3 rounded-[8px] bg-linen p-2">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-xs text-[#808080]">可语音转文字后整理</span>
            <Mic size={16} className="text-copper" />
          </div>
          <TextArea
            value={customerQuote}
            onChange={setCustomerQuote}
            rows={4}
            placeholder="记录客户原话，例如：客户明确表示不喜欢连续换酒店。"
          />
        </div>
      </Card>

      <Card className="songtsam-mobile-card sticky bottom-[78px] z-20">
        <button type="button" className="w-full text-left">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-copper">动态推荐</p>
              <h2 className="mt-1 text-base font-medium">{dynamicProducts[0].name}</h2>
            </div>
            <Tag color="primary" className="!rounded-[4px]">{recommendScore(dynamicProducts[0], mergedTags)}%</Tag>
          </div>
          <p className="mt-2 text-xs leading-[18px] text-[#808080]">
            根据当前回答和标签：{mergedTags.slice(0, 5).join("、")}
          </p>
          <div className="mt-3 space-y-2">
            {dynamicProducts.slice(0, 3).map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-[6px] bg-linen px-2 py-2">
                <span className="min-w-0 flex-1 truncate text-xs">{product.name}</span>
                <span className="ml-2 text-xs text-copper">{recommendScore(product, mergedTags)}%</span>
              </div>
            ))}
          </div>
        </button>
      </Card>

      <Card className="songtsam-mobile-card">
        <SectionTitle eyebrow="AI已更新标签" title="本轮沟通沉淀结果" />
        <div className="mt-3 flex flex-wrap gap-2">
          {mergedTags.map((tag) => (
            <Tag key={tag} color="success" className="!rounded-[4px]">{tag}</Tag>
          ))}
        </div>
      </Card>
    </>
  );
}

function ConfirmStage({
  customer,
  tags,
  selectedProducts,
  followPlan,
  setFollowPlan,
  datePickerOpen,
  setDatePickerOpen,
  methodPickerOpen,
  setMethodPickerOpen,
}: {
  customer: Customer;
  tags: string[];
  selectedProducts: Product[];
  followPlan: FollowPlan;
  setFollowPlan: (plan: FollowPlan) => void;
  datePickerOpen: boolean;
  setDatePickerOpen: (open: boolean) => void;
  methodPickerOpen: boolean;
  setMethodPickerOpen: (open: boolean) => void;
}) {
  return (
    <>
      <Card className="songtsam-warm-card">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-copper" />
          <h2 className="text-lg font-medium">最终需求总结</h2>
        </div>
        <div className="mt-4 space-y-2">
          <InsightLine label="客户类型" value={`${customer.memberLevel}会员，高净值家庭型客户。`} />
          <InsightLine label="出行目的" value="暑期家庭陪伴，兼顾雪山景观、酒店体验和孩子自然教育。" />
          <InsightLine label="核心偏好" value={tags.slice(0, 8).join("、")} />
          <InsightLine label="风险" value="高反、老人孩子同行、连续换酒店和长车程接受度低。" />
          <InsightLine label="不适合产品" value="雨崩徒步、滇藏长线、连续赶路或频繁换酒店方案。" />
        </div>
      </Card>

      <Card className="songtsam-mobile-card">
        <SectionTitle eyebrow="最终标签" title="确认写入客户画像" />
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Tag key={tag} color="success" className="!rounded-[4px]">{tag}</Tag>
          ))}
        </div>
      </Card>

      <Card className="songtsam-mobile-card">
        <SectionTitle eyebrow="最终推荐产品" title="本次建议推荐顺序" />
        <div className="mt-3 space-y-2">
          {selectedProducts.map((product, index) => (
            <div key={product.id} className="flex gap-3 rounded-[8px] bg-linen p-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[4px] bg-copper text-sm font-medium text-white">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium leading-5">{product.name}</h3>
                <p className="mt-1 text-xs leading-[18px] text-[#808080]">{product.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="songtsam-mobile-card">
        <SectionTitle eyebrow="下次跟进计划" title="设置提醒时间与内容" />
        <div className="mt-3 space-y-3">
          <button type="button" onClick={() => setDatePickerOpen(true)} className="flex w-full items-center justify-between rounded-[8px] bg-linen px-3 py-3 text-left">
            <span className="text-sm">跟进时间</span>
            <span className="text-sm text-copper">{formatDateTime(followPlan.time)}</span>
          </button>
          <button type="button" onClick={() => setMethodPickerOpen(true)} className="flex w-full items-center justify-between rounded-[8px] bg-linen px-3 py-3 text-left">
            <span className="text-sm">跟进方式</span>
            <span className="text-sm text-copper">{followPlan.method}</span>
          </button>
          <TextArea
            value={followPlan.content}
            onChange={(value) => setFollowPlan({ ...followPlan, content: value })}
            rows={3}
            placeholder="填写下次跟进内容"
          />
        </div>
      </Card>

      <DatePicker
        visible={datePickerOpen}
        value={followPlan.time}
        precision="minute"
        onClose={() => setDatePickerOpen(false)}
        onConfirm={(value) => setFollowPlan({ ...followPlan, time: value })}
      />
      <Picker
        visible={methodPickerOpen}
        columns={[followMethods.map((method) => ({ label: method, value: method }))]}
        value={[followPlan.method]}
        onClose={() => setMethodPickerOpen(false)}
        onConfirm={(value: PickerValue[]) => setFollowPlan({ ...followPlan, method: String(value[0] ?? followPlan.method) })}
      />
    </>
  );
}

function FollowStage({
  customer,
  tags,
  answers,
  selectedProducts,
  customerQuote,
  followPlan,
  communicationMethod,
}: {
  customer: Customer;
  tags: string[];
  answers: Record<string, string>;
  selectedProducts: Product[];
  customerQuote: string;
  followPlan: FollowPlan;
  communicationMethod: string;
}) {
  return (
    <>
      <Card className="songtsam-mobile-card">
        <SectionTitle eyebrow="跟进管理与存档" title="本次销售留痕" />
        <div className="mt-4 space-y-4">
          <TimelineItem title="本次沟通" detail={`${communicationMethod}，围绕${Object.values(answers).filter(Boolean).join("、")}完成需求确认。`} />
          <TimelineItem title="标签变化" detail={tags.join("、")} />
          <TimelineItem title="AI分析结果" detail="客户适合慢节奏、酒店体验强、自然教育友好的家庭路线；需要规避高强度徒步和连续长车程。" />
          <TimelineItem title="推荐产品" detail={selectedProducts.map((product) => product.name).join("；")} />
          <TimelineItem title="客户原话" detail={customerQuote || "未记录客户原话"} />
          <TimelineItem title="下次待办" detail={`${formatDateTime(followPlan.time)} · ${followPlan.method} · ${followPlan.content}`} />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Button color="primary" className="!h-11 !rounded-[4px] !bg-copper !border-copper">
          一键再次跟进
        </Button>
        <Button fill="outline" className="!h-11 !rounded-[4px] !border-copper !text-copper">
          <Copy size={14} /> 复制总结
        </Button>
      </div>
    </>
  );
}

function JourneyActionBar({
  activeStage,
  setActiveStage,
  onSave,
}: {
  activeStage: StageKey;
  setActiveStage: (stage: StageKey) => void;
  onSave: () => void;
}) {
  if (activeStage === "follow") {
    return (
      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[375px] -translate-x-1/2 border-t border-snow bg-parchment/96 px-4 py-3 shadow-songtsam backdrop-blur">
        <Button block color="primary" className="!h-11 !rounded-[4px] !bg-copper !border-copper">
          再次跟进
        </Button>
      </div>
    );
  }

  const config = {
    pre: { primary: "开始沟通", secondary: "保存", next: "during" as StageKey },
    during: { primary: "沟通结束", secondary: "保存沟通", next: "confirm" as StageKey },
    confirm: { primary: "确认沟通", secondary: "保存", next: "follow" as StageKey },
  }[activeStage];

  return (
    <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[375px] -translate-x-1/2 border-t border-snow bg-parchment/96 px-4 py-3 shadow-songtsam backdrop-blur">
      <div className="grid grid-cols-[1fr_1.4fr] gap-2">
        <Button onClick={onSave} className="!h-11 !rounded-[4px]">
          <Save size={14} /> {config.secondary}
        </Button>
        <Button color="primary" onClick={() => setActiveStage(config.next)} className="!h-11 !rounded-[4px] !bg-copper !border-copper">
          {config.primary}
        </Button>
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs leading-[18px] text-copper">{eyebrow}</p>
      <h2 className="mt-1 text-lg font-medium leading-7">{title}</h2>
    </div>
  );
}

function MiniInfo({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-[8px] bg-linen p-3 ${wide ? "col-span-2" : ""}`}>
      <p className="text-[11px] leading-4 text-[#808080]">{label}</p>
      <p className="mt-1 text-sm font-medium leading-5">{value}</p>
    </div>
  );
}

function InsightLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-white/60 px-3 py-2">
      <p className="text-[11px] leading-4 text-copper">{label}</p>
      <p className="mt-1 text-xs leading-[18px] text-clay/80">{value}</p>
    </div>
  );
}

function SelectableProductCard({ product, selected, onClick }: { product: Product; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[238px] rounded-[12px] border bg-parchment p-3 text-left shadow-soft ${
        selected ? "border-copper" : "border-snow"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium leading-5">{product.name}</h3>
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${selected ? "bg-copper text-white" : "bg-linen text-[#808080]"}`}>
          {selected ? <Check size={14} /> : <Plus size={14} />}
        </span>
      </div>
      <p className="mt-2 text-xs leading-[18px] text-[#808080]">{product.duration} · {product.priceRange}</p>
      <p className="mt-3 text-xs leading-[18px] text-clay/80">{product.reason}</p>
      <p className="mt-2 rounded-[6px] bg-copper/10 px-2 py-1.5 text-[11px] leading-4 text-copper">{product.altitudeRisk}</p>
    </button>
  );
}

function TimelineItem({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="relative border-l border-copper/20 pl-4">
      <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-copper" />
      <h3 className="text-sm font-medium leading-5">{title}</h3>
      <p className="mt-1 text-xs leading-[18px] text-clay/70">{detail}</p>
    </div>
  );
}

function rankProducts(tags: string[]) {
  return [...mockProducts].sort((a, b) => recommendScore(b, tags) - recommendScore(a, tags));
}

function recommendScore(product: Product, tags: string[]) {
  let score = product.score;
  const joined = `${product.name}${product.audience.join("")}${product.reason}${product.notFor.join("")}`;
  if (tags.includes("亲子") && joined.includes("亲子")) score += 8;
  if (tags.includes("自然教育") && joined.includes("自然")) score += 6;
  if (tags.includes("慢节奏") && joined.includes("节奏")) score += 7;
  if (tags.includes("酒店偏好") && joined.includes("酒店")) score += 5;
  if (tags.includes("雪山景观") && joined.includes("梅里")) score += 5;
  if (tags.includes("怕高反") && product.notFor.includes("怕高反")) score -= 18;
  if (tags.includes("带老人") && product.notFor.includes("银发客群")) score -= 14;
  if (tags.includes("低龄儿童") && product.notFor.includes("低龄儿童")) score -= 16;
  if (tags.includes("不接受长车程") && product.id === "tibet-custom") score -= 14;
  return Math.max(42, Math.min(98, score));
}

function formatDateTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
