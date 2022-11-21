import { Form, FormInstance, InputNumber, Slider } from "antd";
import { forwardRef, useImperativeHandle } from "react";
import { useGraphContext } from "../context";
export type SettingsProps = {};
const { Item } = Form;
export type SettingsRef = {
  form: FormInstance<FormValues>;
};
type FormValues = {
  vertexNumberB: number;
  vertexNumberA: number;
  percent: number;
};
const Settings = forwardRef<SettingsRef, SettingsProps>(({ ...props }, ref) => {
  const [form] = Form.useForm<FormValues>();
  const { simpleDataA, simpleDataB } = useGraphContext();
  useImperativeHandle(ref, () => {
    return { form };
  });
  return (
    <>
      <Form
        initialValues={{
          percent: 0.1,
          vertexNumberB: Math.sqrt(simpleDataB.length),
          vertexNumberA: Math.sqrt(simpleDataA.length),
        }}
        form={form}
      >
        <Item
          name="percent"
          label="成边概率"
          tooltip="生成图的时候，两个结点之间有边的概率，为保证结果，没有边的点最后会被随机分配一条边"
          dependencies={["vertexNumberA"]}
        >
          <Slider
            marks={{
              0.1: "10%",
              0.2: "20%",
              0.3: "30%",
              0.4: "40%",
              0.5: "50%",
              0.6: "60%",
              0.7: "70%",
              0.8: "80%",
              0.9: "90%",
              1.0: "100%",
            }}
            min={0.1}
            max={1}
            step={0.1}
          />
        </Item>
        <Item
          name="vertexNumberB"
          label="图B(原图)结点个数"
          dependencies={["vertexNumberA"]}
          rules={[
            ({ getFieldsValue }) => ({
              validator() {
                const values = getFieldsValue();
                if (values.vertexNumberB < values.vertexNumberA) {
                  return Promise.reject(
                    new Error("图B(原图)结点个数不能少于图A(子图)结点个数")
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <InputNumber max={100} min={2} />
        </Item>
        <Item
          name="vertexNumberA"
          label="图A(子图)结点个数"
          dependencies={["vertexNumberB"]}
          rules={[
            ({ getFieldsValue }) => ({
              validator() {
                const values = getFieldsValue();
                if (values.vertexNumberB < values.vertexNumberA) {
                  return Promise.reject(
                    new Error("图A(子图)结点个数不能多于图B(原图)结点个数")
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <InputNumber max={100} min={2} />
        </Item>
      </Form>
    </>
  );
});
export default Settings;
