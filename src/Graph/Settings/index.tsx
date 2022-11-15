import { Form, FormInstance, InputNumber } from "antd";
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
          vertexNumberB: Math.sqrt(simpleDataB.length),
          vertexNumberA: Math.sqrt(simpleDataA.length),
        }}
        form={form}
      >
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
