import { MoreOutlined } from "@ant-design/icons";
import { Form, InputNumber, Popover, Button } from "antd";
import React, { useEffect, useRef, useState } from "react";

const RowPop: React.FC<{ handleBatchAdd?: (count: number) => void }> = (props) => {
  const { handleBatchAdd } = props
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let interval = setInterval(() => {
      inputRef.current?.focus()
    }, 200)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return <Form initialValues={{ count: 10 }} onFinish={(values) => {
    handleBatchAdd && handleBatchAdd(values.count)
  }}
  >
    <Form.Item style={{ marginBottom: 0 }} label="行数" name="count">
      <InputNumber style={{ width: 100 }} ref={inputRef} min={1} max={100}
        onClick={(e) => {
          (e.nativeEvent.target as HTMLInputElement).focus()
          e.stopPropagation()
        }}
      />
    </Form.Item>
  </Form>
}

export const AddButton: React.FC<{ handleAdd?: () => void, handleBatchAdd?: (count: number) => void }> = (props) => {
  const { handleAdd, handleBatchAdd } = props
  const [open, setOpen] = useState(false)


  if (!handleAdd && !handleBatchAdd) {
    return null

  }

  return <Button
    type="dashed"
    style={{ width: '100%', height: 32 }}
    onClick={(e) => {
      handleAdd()
    }}
  >
    + 添加
    <Popover open={open} getPopupContainer={(node) => node.parentNode as HTMLElement} onOpenChange={setOpen} trigger={['click']} destroyTooltipOnHide content={
      <RowPop handleBatchAdd={handleBatchAdd} />
    }>
      <MoreOutlined style={{ marginLeft: 0 }} onClick={(e) => {
        e.stopPropagation()
      }} />
    </Popover>
  </Button>

}