import * as React from 'react'
export function Tabs({ defaultValue, children }:{ defaultValue:string; children:React.ReactNode }) {
  const [val, setVal] = React.useState(defaultValue)
  return <div data-tabs>
    {React.Children.map(children, (child:any)=> React.cloneElement(child, { __tabsValue: val, __setTabsValue: setVal }))}
  </div>
}
export function TabsList({ children, __tabsValue, __setTabsValue }:{ children:any; __tabsValue?:string; __setTabsValue?:(v:string)=>void }) {
  return <div className="mb-2 inline-flex rounded-md border bg-white">{React.Children.map(children, (child:any)=> React.cloneElement(child, { __tabsValue, __setTabsValue }))}</div>
}
export function TabsTrigger({ value, children, __tabsValue, __setTabsValue }:{ value:string; children:any; __tabsValue?:string; __setTabsValue?:(v:string)=>void }) {
  const active = __tabsValue===value
  return <button onClick={()=>__setTabsValue && __setTabsValue(value)} className={`px-3 py-1 text-sm ${active?'bg-neutral-900 text-white':'hover:bg-neutral-100'}`}>{children}</button>
}
export function TabsContent({ value, children, __tabsValue }:{ value:string; children:any; __tabsValue?:string }) {
  if (__tabsValue!==value) return null
  return <div>{children}</div>
}
