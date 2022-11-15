import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Allotment } from "allotment";
import random from "lodash/random";
import "allotment/dist/style.css";
import "./index.css";
import G6, {
  Graph as G,
  GraphData,
  EdgeConfig,
  NodeConfig,
  INode,
  IEdge,
} from "@antv/g6";
import Settings, { SettingsRef } from "./Settings";
import {
  Button,
  Descriptions,
  Divider,
  Form,
  Pagination,
  Radio,
  Space,
  Table,
  Tag,
} from "antd";
import { FIND_ISOMORPHISM, Provider } from "./context";
import { useFindIsomorpism } from "./hook";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnType } from "antd/lib/table";
import { sourceA, sourceB } from "./data";
export type GraphProps = {};
const defaultEdgeStyle = { lineWidth: 1, stroke: "rgb(95, 149, 255)" };
// 实例化 minimap 插件
const minimap = new G6.Minimap({
  size: [100, 100],
  container: "graphAMap",
  className: "minimap",
  type: "delegate",
});
const buildGraphData = (
  arr: number[],
  idPrefix: string,
  hasLabel: boolean = true
): GraphData => {
  const verticesLength = Math.sqrt(arr.length);
  const edges: EdgeConfig[] = [];
  for (let i = 0; i < verticesLength; i++) {
    for (let j = i + 1; j < verticesLength; j++) {
      if (arr[i * verticesLength + j] == 1) {
        edges.push({
          source: `${idPrefix}${i}`,
          target: `${idPrefix}${j}`,
          style: defaultEdgeStyle,
        });
      }
    }
  }

  const nodes: NodeConfig[] = new Array(verticesLength).fill(1).map((_v, i) => {
    let label = hasLabel ? `${i + 1}` : undefined;
    const style: NodeConfig["style"] = {};
    return {
      id: `${idPrefix}${i}`,
      size: 20,
      label,
      style,
    };
  });
  return {
    nodes,
    edges,
  };
};
const randomExcept = (lower: number, upper: number, except: number): number => {
  const r = random(lower, upper);
  if (r === except) {
    return randomExcept(lower, upper, except);
  }
  return r;
};
const generateRandomGraph = (verticesLength: number) => {
  const arr: number[][] = [];
  for (let i = 0; i < verticesLength; i++) {
    arr[i] = [];
  }
  for (let i = 0; i < verticesLength; i++) {
    arr[i][i] = 0;
    for (let j = i + 1; j < verticesLength; j++) {
      const hasEdge = Math.round(Math.random());
      arr[i][j] = hasEdge;
      arr[j][i] = hasEdge;
    }
  }
  for (let i = 0; i < verticesLength; i++) {
    let hasEdge = 0;
    for (let j = i + 1; j < verticesLength; j++) {
      if (arr[i][j]) {
        hasEdge = 1;
      }
    }
    if (!hasEdge) {
      const j = randomExcept(0, verticesLength - 1, i);
      arr[i][j] = 1;
      arr[j][i] = 1;
    }
  }
  return arr.flat();
};

const Graph: FC<GraphProps> = ({ ...props }) => {
  let graphA = useRef<G>();
  let graphB = useRef<G>();
  const [algorithm, setAlgorithm] = useState<FIND_ISOMORPHISM>(
    FIND_ISOMORPHISM.ULLMANN
  );
  const [simpleDataA, setSimpleDataA] = useState<number[]>(sourceA);
  const [simpleDataB, setSimpleDataB] = useState<number[]>(sourceB);

  const dataA = useMemo(() => buildGraphData(simpleDataA, "A"), [simpleDataA]);
  const dataB = useMemo(
    () => buildGraphData(simpleDataB, "B", true),
    [simpleDataB]
  );
  const { refetch, isFetching, queryKey, data, remove } = useFindIsomorpism(
    simpleDataA,
    simpleDataB,
    algorithm
  );
  const [resultIndex, setResultIndex] = useState<number | null>(null);
  const resultMap = useMemo(() => {
    if (resultIndex !== null) {
      return data?.resultMaps[resultIndex];
    }
    return null;
  }, [data?.resultMaps, resultIndex]);
  useEffect(() => {
    if (data) {
      setResultIndex(0);
    }
  }, [data]);
  const updates = useRef<{ nodes: INode[]; edges: IEdge[] }>({
    nodes: [],
    edges: [],
  });
  const resetNode = () => {
    updates.current.nodes.forEach((node) => {
      node.update({
        style: { fill: "rgb(247, 250, 255)" },
        labelCfg: { style: { fill: "#000" } },
        label: `${Number(node.getID().replace("B", "")) + 1}`,
      });
    });
    updates.current.edges.forEach((edge) => {
      edge.update({
        style: defaultEdgeStyle,
      });
    });
    updates.current = { nodes: [], edges: [] };
  };
  useEffect(() => {
    if (resultMap) {
      resetNode();
      resultMap.map(([idInA, idInB]) => {
        const nodeInB = graphB.current!.getNodes()[idInB];
        nodeInB.update({
          style: { fill: "red" },
          labelCfg: { style: { fill: "white" } },
          label: `${idInA + 1}`,
          zIndex: 9999,
        });
        updates.current.nodes.push(nodeInB);
        const nodeInA = graphA.current!.getNodes()[idInA];
        nodeInA.getEdges().map((e) => {
          let n = e.getSource();
          if (n === nodeInA) {
            n = e.getTarget();
          }
          const id = Number(n.getID().replace("A", ""));
          resultMap.forEach(([idInA, idInB]) => {
            if (id === idInA) {
              const nodeInB_2 = graphB.current!.getNodes()[idInB];
              const edge = graphB
                .current!.getEdges()
                .find(
                  (e) =>
                    (e.getSource() === nodeInB &&
                      e.getTarget() === nodeInB_2) ||
                    (e.getSource() === nodeInB_2 && e.getTarget() === nodeInB)
                );
              edge?.update({
                style: { lineWidth: 3, stroke: "red" },
                zIndex: 9999,
              });
              edge && updates.current.edges.push(edge);
            }
          });
        });
      });
    }
  }, [resultMap]);
  const queryClient = useQueryClient();
  const resizeEventB = useCallback(() => {
    graphB.current?.changeSize(
      document.getElementById("graphB")!.clientWidth,
      document.getElementById("graphB")!.clientHeight
    );
    graphB.current?.fitView();
  }, []);
  const resizeEventA = useCallback(() => {
    graphA.current?.changeSize(
      document.getElementById("graphA")!.clientWidth,
      document.getElementById("graphA")!.clientHeight
    );
    graphA.current?.fitView();
  }, []);
  useEffect(() => {
    const modes = { default: ["drag-canvas", "zoom-canvas", "drag-node"] };
    const ga = new G6.Graph({
      modes,
      container: "graphA",
      fitView: true,
      width: 500,
      height: 300,
      fitCenter: true,
      layout: {
        type: "random",
        width: 500,
        height: 200,
      },
    });
    const gb = new G6.Graph({
      modes,
      container: "graphB",
      fitView: true,
      fitCenter: true,
      fitViewPadding: [100, 100],
      width: 600,
      height: 500,
      plugins: [minimap],
      layout: {
        type: "random",
        width: 500,
        height: 200,
      },
    });
    graphA.current = ga;
    graphB.current = gb;
    setTimeout(resizeEventB, 100);
    setTimeout(resizeEventA, 100);
    window.addEventListener("resize", resizeEventB);
    window.addEventListener("resize", resizeEventA);
    return () => {
      window.removeEventListener("resize", resizeEventB);
      window.removeEventListener("resize", resizeEventA);
    };
  }, []);
  useEffect(() => {
    console.log(graphA.current?.getNodes());
    console.log(graphA.current?.getEdges());
    graphA.current!.data(dataA); // 加载数据
    graphA.current!.render(); // 渲染
    graphB.current!.data(dataB); // 加载数据
    graphB.current!.render(); // 渲染
  }, [dataA, dataB]);
  const settingsRef = useRef<SettingsRef>(null);
  const reset = () => {
    setResultIndex(null);
    remove();
    resetNode();
    updates.current = { nodes: [], edges: [] };
  };
  console.log(data);

  return (
    <>
      <Provider value={{ simpleDataA, simpleDataB }}>
        <Allotment
          onChange={() => {
            resizeEventB();
            resizeEventA();
          }}
          defaultSizes={[800, 500]}
        >
          <Allotment.Pane minSize={200}>
            <div style={{ height: "100vh" }} id="graphB" />{" "}
            <Tag
              style={{ position: "absolute", right: 0, top: 0 }}
              color="processing"
            >
              <span style={{ fontSize: 20 }}>B(原图)</span>
            </Tag>
          </Allotment.Pane>
          <Allotment.Pane minSize={200}>
            <Allotment
              onChange={() => {
                resizeEventA();
              }}
              vertical
              defaultSizes={[200, 500]}
            >
              <Allotment.Pane minSize={200}>
                <div id="graphA" style={{ height: `100%` }} />
                <Tag
                  style={{ position: "absolute", left: 0, top: 0 }}
                  color="processing"
                >
                  <span style={{ fontSize: 20 }}>A(子图)</span>
                </Tag>
              </Allotment.Pane>
              <div style={{ padding: 16, overflow: "auto" }}>
                <Form.Item label="算法">
                  <Radio.Group
                    onChange={(e) => {
                      setAlgorithm(e.target.value);
                    }}
                    value={algorithm}
                    optionType="button"
                    buttonStyle="solid"
                    options={[
                      {
                        label: FIND_ISOMORPHISM.ULLMANN as string,
                        value: FIND_ISOMORPHISM.ULLMANN,
                      },
                      {
                        label: FIND_ISOMORPHISM.VF as string,
                        value: FIND_ISOMORPHISM.VF,
                      },
                    ]}
                  />
                </Form.Item>

                <Settings ref={settingsRef} />
                <Space direction="vertical">
                  <Space>
                    <Button
                      loading={isFetching}
                      type="primary"
                      onClick={async () => {
                        refetch();
                      }}
                    >
                      查找子图
                    </Button>
                    <Button
                      disabled={isFetching}
                      onClick={async () => {
                        const values =
                          await settingsRef.current?.form.validateFields();
                        if (!values) {
                          return;
                        }
                        queryClient.cancelQueries(queryKey);
                        reset();
                        setSimpleDataA(
                          generateRandomGraph(values.vertexNumberA)
                        );
                        setSimpleDataB(
                          generateRandomGraph(values.vertexNumberB)
                        );
                      }}
                    >
                      重新生成图
                    </Button>
                    <Button disabled={isFetching} danger onClick={reset}>
                      删除结果集
                    </Button>
                  </Space>
                  {data && data.length > 0 && resultIndex !== null && (
                    <>
                      <Divider>查询结果</Divider>
                      <Descriptions column={2} bordered size="small">
                        <Descriptions.Item span={2} label="算法">
                          {data.algorithm}
                        </Descriptions.Item>
                        <Descriptions.Item label="图B(原图个数)">
                          {data.BLength}
                        </Descriptions.Item>
                        <Descriptions.Item label="图A(子图个数)">
                          {data.ALength}
                        </Descriptions.Item>
                        <Descriptions.Item label="运行时长">
                          {data.time > 1000
                            ? data.time > 1000 * 60
                              ? `${(data.time / 1000 / 60).toFixed(2)}min`
                              : `${data.time / 1000}s`
                            : `${data.time}ms`}
                        </Descriptions.Item>
                        <Descriptions.Item label="匹配个数">
                          {data.length}
                        </Descriptions.Item>
                        <Descriptions.Item label="结果集" span={2}>
                          <Table
                            bordered
                            size="small"
                            dataSource={
                              data.algorithm === FIND_ISOMORPHISM.ULLMANN
                                ? data.matrix![resultIndex].map((e, i) => {
                                    return {
                                      row: i + 1,
                                      ...Object.fromEntries(
                                        e.map((f, i) => [i, f])
                                      ),
                                    };
                                  })
                                : data.resultMaps[resultIndex].map(
                                    ([A, B], i) => ({
                                      row: i + 1,
                                      A: A + 1,
                                      B: B + 1,
                                    })
                                  )
                            }
                            rowKey={"row"}
                            pagination={false}
                            columns={
                              data.algorithm === FIND_ISOMORPHISM.ULLMANN
                                ? [
                                    {
                                      dataIndex: "row",
                                      key: `row`,
                                      align: "center",
                                      className: "Array-M-Row",
                                    },
                                    ...data.matrix![0][0].map<ColumnType<any>>(
                                      (_d, i) => {
                                        return {
                                          dataIndex: i,
                                          title: (
                                            <div className="Array-M-Column">
                                              {i + 1}
                                            </div>
                                          ),
                                          align: "center",
                                          render(data) {
                                            if (data === 1) {
                                              return (
                                                <b style={{ color: "red" }}>
                                                  {data}
                                                </b>
                                              );
                                            }
                                            return data;
                                          },
                                        };
                                      }
                                    ),
                                  ]
                                : [
                                    {
                                      title: "A",
                                      dataIndex: "A",
                                      align: "center",
                                    },
                                    {
                                      title: "B",
                                      dataIndex: "B",
                                      align: "center",
                                    },
                                  ]
                            }
                          />
                          <Pagination
                            simple
                            pageSize={1}
                            onChange={(page) => {
                              setResultIndex(page - 1);
                            }}
                            current={resultIndex + 1}
                            total={data.length}
                          />
                        </Descriptions.Item>
                      </Descriptions>
                    </>
                  )}
                </Space>
              </div>
            </Allotment>
          </Allotment.Pane>
        </Allotment>
        <div
          id="graphAMap"
          style={{
            border: "1px solid #ddd",
            position: "fixed",
            left: 0,
            top: 0,
            width: 100,
            height: 100,
          }}
        />
      </Provider>
    </>
  );
};
export default Graph;
