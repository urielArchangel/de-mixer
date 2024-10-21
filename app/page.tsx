import TabApp from "@/src/FE/components/antd/Tabs";
import React from "react";

function page() {
 
  return (
    <div>
      <TabApp contractAddr={process.env.CONTRACT} />
   
    </div>
  );
}

export default page;
