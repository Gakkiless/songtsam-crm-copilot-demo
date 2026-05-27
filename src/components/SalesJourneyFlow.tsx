import {
  ArrowLeft,
  Bot,
  Check,
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
type FollowPlan = { time: Date | null; method: string; content: string };

type SalesJourneyFlowProps = {
  customer: Customer;
  onClose: () => void;
};

const stageItems: Array<{ key: StageKey; title: string }> = [
  { key: "pre", title: "沟通前" },
  { key: "during", title: "沟通中" },
  { key: "confirm", title: "需求确认" },
  { key: "follow", title: "跟进管理" },
];

const tagDimensions = [
  { title: "人群关系", options: ["亲子", "三代同游", "夫妻同行", "企业家", "摄影客", "银发同行"] },
  { title: "旅行偏好", options: ["慢节奏", "酒店偏好", "雪山景观", "藏文化", "自然教育", "轻徒步"] },
  { title: "风险顾虑", options: ["怕高反", "带老人", "低龄儿童", "时间敏感", "不想换酒店", "不接受长车程"] },
  { title: "行为信号", options: ["近期浏览梅里", "咨询暑期", "复购潜力", "等待报价", "预算明确", "高转化"] },
];

const tagGroups: Record<string, string[]> = {
  人群关系: ["亲子", "三代同游", "夫妻同行", "企业家", "摄影客", "银发同行", "独行", "朋友同行"],
  旅行偏好: ["慢节奏", "酒店偏好", "雪山景观", "藏文化", "自然教育", "轻徒步", "放松度假", "深度体验"],
  风险顾虑: ["怕高反", "带老人", "低龄儿童", "时间敏感", "不想换酒店", "不接受长车程", "首次高原", "高原经验", "需要教育"],
  行为信号: ["近期浏览梅里", "咨询暑期", "复购潜力", "等待报价", "预算明确", "高转化", "等待方案", "预算待确认", "家庭决策", "高客单"],
};

const communicationMethods = ["企业微信", "电话沟通", "线下面谈", "到店沟通", "会员活动", "家庭群沟通", "其他"];

const followMethods = ["企业微信", "电话回访", "线下面谈", "发送方案", "会员活动邀约", "管家协同"];

const surveyQuestions = [
  {
    id: "companions",
    category: "现状探索",
    title: "您会计划和谁一起来松赞？",
    options: [
      { label: "独自一人", tags: ["独行", "放松度假"], intent: "独处放松需求" },
      { label: "夫妻同行", tags: ["夫妻同行", "慢节奏"], intent: "双人度假需求" },
      { label: "家人同行", tags: ["亲子", "三代同游", "带老人"], intent: "家庭旅行需求" },
      { label: "朋友结伴", tags: ["朋友同行", "轻徒步"], intent: "结伴体验需求" },
    ],
  },
  {
    id: "plateau",
    category: "现状探索",
    title: "您之前有没有来过高原地区？或者去过松赞？",
    options: [
      { label: "第一次高原", tags: ["首次高原", "怕高反"], intent: "海拔适应优先" },
      { label: "去过高原", tags: ["高原经验", "轻徒步"], intent: "可接受标准体验" },
      { label: "去过松赞", tags: ["复购潜力", "藏文化"], intent: "复购深化体验" },
      { label: "不确定", tags: ["需要教育", "怕高反"], intent: "需要高反说明" },
    ],
  },
  {
    id: "reason",
    category: "痛点挖掘",
    title: "您最近是因为什么原因想出来走走了？",
    options: [
      { label: "工作压力大", tags: ["放松度假", "酒店偏好", "慢节奏"], intent: "身心放松需求" },
      { label: "想换环境", tags: ["雪山景观", "自然教育"], intent: "景观疗愈需求" },
      { label: "陪伴家人", tags: ["亲子", "三代同游"], intent: "家庭陪伴需求" },
      { label: "纪念日旅行", tags: ["夫妻同行", "高客单"], intent: "仪式感定制需求" },
    ],
  },
  {
    id: "ideal",
    category: "痛点挖掘",
    title: "您理想中的旅行是什么样的？",
    options: [
      { label: "轻松度假", tags: ["慢节奏", "酒店偏好"], intent: "舒适酒店路线" },
      { label: "深度体验", tags: ["藏文化", "深度体验"], intent: "文化深度路线" },
      { label: "自然教育", tags: ["亲子", "自然教育"], intent: "亲子自然教育路线" },
      { label: "看雪山", tags: ["雪山景观", "怕高反"], intent: "梅里雪山方向" },
    ],
  },
  {
    id: "impact",
    category: "影响放大",
    title: "您觉得一次真正让您印象深刻的旅行，会对您接下来有什么影响？",
    options: [
      { label: "重新充电", tags: ["放松度假", "慢节奏"], intent: "疗愈恢复价值" },
      { label: "增进亲子关系", tags: ["亲子", "自然教育"], intent: "家庭关系价值" },
      { label: "打开孩子眼界", tags: ["自然教育", "藏文化"], intent: "教育成长价值" },
      { label: "留下家庭记忆", tags: ["三代同游", "雪山景观"], intent: "家庭纪念价值" },
    ],
  },
  {
    id: "value",
    category: "价值引导",
    title: "如果有一个行程既有文化深度又能放松身心，您觉得怎么样？",
    options: [
      { label: "很适合", tags: ["藏文化", "慢节奏", "高转化"], intent: "可推进具体方案" },
      { label: "想了解", tags: ["等待方案", "深度体验"], intent: "需要内容种草" },
      { label: "看预算", tags: ["预算待确认"], intent: "需要价格锚定" },
      { label: "家人确认", tags: ["家庭决策"], intent: "需要辅助决策材料" },
    ],
  },
];

export default function SalesJourneyFlow({ customer, onClose }: SalesJourneyFlowProps) {
  const [activeStage, setActiveStage] = useState<StageKey>("pre");
  const [manualTags, setManualTags] = useState(["亲子", "怕高反", "酒店偏好", "慢节奏"]);
  const [selectedProductIds, setSelectedProductIds] = useState(["meili-slow", "family-nature"]);
  const [communicationMethod, setCommunicationMethod] = useState("企业微信");
  const [answers, setAnswers] = useState<Record<string, string>>({
    companions: "家人同行",
    plateau: "第一次高原",
    reason: "陪伴家人",
    ideal: "轻松度假",
  });
  const [customerQuote, setCustomerQuote] = useState("客户明确表示不喜欢连续换酒店，希望老人和孩子都轻松一点。");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [methodPickerOpen, setMethodPickerOpen] = useState(false);
  const [followPlan, setFollowPlan] = useState<FollowPlan>({
    time: null,
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

  const removedTags = useMemo(() => getRemovedTags(manualTags, answerTags), [answerTags, manualTags]);
  const replacedTagChanges = useMemo(() => getReplacedTagChanges(manualTags, answerTags), [answerTags, manualTags]);
  const mergedTags = useMemo(
    () => Array.from(new Set([...manualTags.filter((tag) => !removedTags.includes(tag)), ...answerTags])),
    [answerTags, manualTags, removedTags],
  );
  const dynamicProducts = useMemo(() => rankProducts(mergedTags), [mergedTags]);
  const selectedProducts = useMemo(
    () => mockProducts.filter((product) => selectedProductIds.includes(product.id)),
    [selectedProductIds],
  );
  const activeStageTitle = stageItems.find((stage) => stage.key === activeStage)?.title ?? "沟通前";

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
            preTags={manualTags}
            answerTags={answerTags}
            removedTags={removedTags}
            replacedTagChanges={replacedTagChanges}
            mergedTags={mergedTags}
            customerQuote={customerQuote}
            setCustomerQuote={setCustomerQuote}
            dynamicProducts={dynamicProducts}
            selectedProductIds={selectedProductIds}
            toggleProduct={toggleProduct}
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
        onSave={() => saveCurrentStage(activeStage === "pre" ? "已保存沟通前信息" : "已保存本次沟通")}
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
          <h2 className="text-lg font-medium">AI沟通前分析</h2>
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
  preTags,
  answerTags,
  removedTags,
  replacedTagChanges,
  mergedTags,
  customerQuote,
  setCustomerQuote,
  dynamicProducts,
  selectedProductIds,
  toggleProduct,
}: {
  customer: Customer;
  communicationMethod: string;
  setCommunicationMethod: (method: string) => void;
  answers: Record<string, string>;
  setAnswers: (answers: Record<string, string>) => void;
  preTags: string[];
  answerTags: string[];
  removedTags: string[];
  replacedTagChanges: Array<{ group: string; from: string[]; to: string[] }>;
  mergedTags: string[];
  customerQuote: string;
  setCustomerQuote: (value: string) => void;
  dynamicProducts: Product[];
  selectedProductIds: string[];
  toggleProduct: (id: string) => void;
}) {
  const addedTags = answerTags.filter((tag) => !preTags.includes(tag));

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
        <SectionTitle eyebrow="预判标签" title="沟通前带入的客户判断" />
        <div className="mt-3 flex flex-wrap gap-2">
          {preTags.map((tag) => (
            <Tag key={tag} color="default" className="!rounded-[4px]">{tag}</Tag>
          ))}
        </div>
      </Card>

      <Card className="songtsam-mobile-card">
        <SectionTitle eyebrow="需求挖掘问卷" title="根据客户回答沉淀需求标签" />
        <div className="mt-3 space-y-6">
          {surveyQuestions.map((question) => (
            <div key={question.id}>
              <p className="mb-1 text-xs leading-[18px] text-copper">{question.category}</p>
              <p className="mb-2 text-sm font-medium leading-5">{question.title}</p>
              <Selector
                showCheckMark={false}
                value={answers[question.id] ? [answers[question.id]] : []}
                options={question.options.map((option) => ({ label: option.label, value: option.label }))}
                onChange={(value) => setAnswers({ ...answers, [question.id]: String(value[0] ?? "") })}
              />
              {answers[question.id] && (
                <p className="mt-2 rounded-[6px] bg-copper/10 px-2 py-1.5 text-xs leading-[18px] text-copper">
                  规则匹配：{question.options.find((option) => option.label === answers[question.id])?.intent}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="songtsam-mobile-card">
        <SectionTitle eyebrow="标签映射结果" title="本轮沟通需求变化" />
        <div className="mt-3 space-y-3">
          <div>
            <p className="mb-2 text-xs text-[#808080]">本轮新增/强化标签</p>
            <div className="flex flex-wrap gap-2">
              {(addedTags.length ? addedTags : answerTags).map((tag) => (
                <Tag key={tag} color="success" className="!rounded-[4px]">{tag}</Tag>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-[#808080]">本轮取消/弱化标签</p>
            <div className="flex flex-wrap gap-2">
              {removedTags.length ? (
                removedTags.map((tag) => (
                  <Tag key={tag} color="default" className="!rounded-[4px]">{tag}</Tag>
                ))
              ) : (
                <span className="text-xs leading-[22px] text-[#999]">暂无取消标签</span>
              )}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-[#808080]">同维度标签替换</p>
            <div className="space-y-2">
              {replacedTagChanges.length ? (
                replacedTagChanges.map((change) => (
                  <div key={change.group} className="rounded-[6px] bg-linen px-2 py-2 text-xs leading-[18px] text-clay/80">
                    <span className="text-[#808080]">{change.group}：</span>
                    {change.from.join("、")} → <span className="text-copper">{change.to.join("、")}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs leading-[22px] text-[#999]">暂无替换标签</span>
              )}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-[#808080]">合并后本次沟通标签</p>
            <div className="flex flex-wrap gap-2">
              {mergedTags.map((tag) => (
                <Tag key={tag} color="primary" className="!rounded-[4px]">{tag}</Tag>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="songtsam-mobile-card">
        <div className="w-full text-left">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-copper">动态推荐</p>
              <h2 className="mt-1 text-base font-medium">{dynamicProducts[0].name}</h2>
            </div>
            <Tag color="primary" className="!rounded-[4px]">{recommendScore(dynamicProducts[0], mergedTags)}%</Tag>
          </div>
          <p className="mt-2 text-xs leading-[18px] text-[#808080]">
            根据当前回答和标签：{mergedTags.slice(0, 5).join("、")}。点击产品代表本轮沟通已推荐。
          </p>
          <div className="mt-3 space-y-2">
            {dynamicProducts.slice(0, 3).map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => toggleProduct(product.id)}
                className={`flex w-full items-center justify-between rounded-[6px] border px-2 py-2 text-left ${
                  selectedProductIds.includes(product.id) ? "border-copper bg-copper/10" : "border-transparent bg-linen"
                }`}
              >
                <span className="min-w-0 flex-1 truncate text-xs">{product.name}</span>
                <span className="ml-2 flex items-center gap-2 text-xs text-copper">
                  {recommendScore(product, mergedTags)}%
                  <span className={`grid h-5 w-5 place-items-center rounded-full ${selectedProductIds.includes(product.id) ? "bg-copper text-white" : "bg-white text-[#999]"}`}>
                    {selectedProductIds.includes(product.id) ? <Check size={12} /> : <Plus size={12} />}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="songtsam-mobile-card">
        <SectionTitle eyebrow="客户真实原话" title="客户反馈" />
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
        <SectionTitle eyebrow="最终推荐产品" title="沟通中已推荐的产品" />
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
            <span className={followPlan.time ? "text-sm text-copper" : "text-sm text-[#999]"}>
              {followPlan.time ? formatDateTime(followPlan.time) : "请选择跟进时间"}
            </span>
          </button>
          <button type="button" onClick={() => setMethodPickerOpen(true)} className="flex w-full items-center justify-between rounded-[8px] bg-linen px-3 py-3 text-left">
            <span className="text-sm">跟进方式</span>
            <span className="text-sm text-copper">{followPlan.method}</span>
          </button>
          <div className="rounded-[8px] bg-linen p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium leading-5">跟进内容</p>
              <button type="button" aria-label="语音输入" className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] bg-white text-copper">
                <Mic size={14} />
              </button>
            </div>
            <div className="rounded-[8px] bg-white p-2">
              <TextArea
                value={followPlan.content}
                onChange={(value) => setFollowPlan({ ...followPlan, content: value })}
                rows={4}
                placeholder="例如：发送梅里轻奢慢行方案，并确认老人和孩子对高反的顾虑"
              />
            </div>
          </div>
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
  const currentFollowTime = followPlan.time ?? makeRelativeDate(0, 15, 30);
  const followRecords = [
    {
      time: currentFollowTime,
      items: [
        { title: "本次沟通", detail: `${communicationMethod}，围绕${Object.values(answers).filter(Boolean).join("、")}完成需求确认。` },
        { title: "标签变化", detail: tags.join("、") },
        { title: "AI分析结果", detail: `${customer.name}适合慢节奏、酒店体验强、自然教育友好的家庭路线；需要规避高强度徒步和连续长车程。` },
        { title: "推荐产品", detail: selectedProducts.map((product) => product.name).join("；") },
        { title: "订单结果", detail: "暂无新增订单。当前跟进仍处于需求确认阶段，待销售发送方案后继续观察转化。" },
        { title: "客户原话", detail: customerQuote || "未记录客户原话" },
        {
          title: "下次待办",
          detail: `${followPlan.time ? formatDateTime(followPlan.time) : "未设置跟进时间"} · ${followPlan.method} · ${followPlan.content}`,
        },
      ],
    },
    {
      time: makeRelativeDate(3, 10, 12),
      items: [
        { title: "沟通方式", detail: "企业微信" },
        { title: "客户反馈", detail: "客户对梅里雪山方向有兴趣，但担心老人高反，希望先了解海拔和酒店连续入住安排。" },
        { title: "标签变化", detail: "新增：怕高反、带老人、酒店偏好" },
        { title: "推荐产品", detail: "香格里拉 - 梅里雪山 6天5晚；香格里拉亲子自然探索 5天4晚" },
        { title: "订单结果", detail: "已生成报价单 Q20260524-018，推荐产品为香格里拉 - 梅里雪山 6天5晚，预估金额￥86,800，客户待家人确认。" },
        { title: "下次待办", detail: "补充梅里轻奢慢行方案，并说明德钦段海拔适应建议。" },
      ],
    },
    {
      time: makeRelativeDate(7, 19, 20),
      items: [
        { title: "沟通方式", detail: "电话沟通" },
        { title: "客户反馈", detail: "客户确认暑期有6天左右时间，预算约8万，家庭成员为夫妻、孩子和父母。" },
        { title: "标签变化", detail: "新增：亲子、三代同游、预算明确、咨询暑期" },
        { title: "AI分析结果", detail: "客户决策链较长，需要兼顾老人舒适度与孩子体验，适合先用轻松方案建立信任。" },
        { title: "订单结果", detail: "产生咨询单 C20260520-062，关联推荐方向为梅里轻奢慢行，尚未进入报价。" },
        { title: "下次待办", detail: "等待客户家庭成员确认具体出行日期。" },
      ],
    },
    {
      time: makeRelativeDate(16, 14, 8),
      items: [
        { title: "沟通方式", detail: "会员活动" },
        { title: "客户反馈", detail: "客户参加松赞会员分享后，对雪山、在地文化和酒店景观产生兴趣。" },
        { title: "标签变化", detail: "新增：雪山景观、藏文化、复购潜力" },
        { title: "推荐产品", detail: "梅里轻奢慢行方向；香格里拉深度体验方向" },
        { title: "订单结果", detail: "活动后7天内无新增订单，但客户浏览梅里相关内容3次，推荐方向被验证为有效兴趣。" },
        { title: "下次待办", detail: "活动后一周内通过企微发送梅里内容，观察客户反馈。" },
      ],
    },
  ];

  return (
    <>
      {followRecords.map((record) => (
        <Card key={record.time.toISOString()} className="songtsam-mobile-card">
          <h2 className="text-lg font-medium leading-7">{formatFollowRecordTime(record.time)}跟进</h2>
          <div className="mt-4 space-y-4">
            {record.items.map((item) => (
              <TimelineItem key={`${record.time.toISOString()}-${item.title}`} title={item.title} detail={item.detail} />
            ))}
          </div>
        </Card>
      ))}
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
    return null;
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
          <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
            <Save size={14} />
            <span>{config.secondary}</span>
          </span>
        </Button>
        <Button color="primary" onClick={() => setActiveStage(config.next)} className="!h-11 !rounded-[4px]">
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

function getRemovedTags(preTags: string[], answerTags: string[]) {
  return preTags.filter((tag) => {
    const group = getTagGroup(tag);
    if (!group) return false;
    const hasAnswerInSameGroup = answerTags.some((answerTag) => getTagGroup(answerTag) === group);
    return hasAnswerInSameGroup && !answerTags.includes(tag);
  });
}

function getReplacedTagChanges(preTags: string[], answerTags: string[]) {
  return Object.entries(tagGroups)
    .map(([group, groupTags]) => {
      const from = preTags.filter((tag) => groupTags.includes(tag));
      const to = answerTags.filter((tag) => groupTags.includes(tag));
      const removed = from.filter((tag) => !to.includes(tag));
      const added = to.filter((tag) => !from.includes(tag));
      return { group, from: removed, to: added };
    })
    .filter((change) => change.from.length > 0 && change.to.length > 0);
}

function getTagGroup(tag: string) {
  return Object.entries(tagGroups).find(([, tags]) => tags.includes(tag))?.[0];
}

function formatDateTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function makeRelativeDate(daysAgo: number, hour: number, minute: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function formatFollowRecordTime(date: Date) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.max(0, Math.floor((startOfToday - startOfTarget) / 86400000));
  const pad = (value: number) => String(value).padStart(2, "0");
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  if (diffDays === 0) return `今天 ${time}`;
  if (diffDays <= 10) return `${diffDays}天前`;
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${time}`;
}
