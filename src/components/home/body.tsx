import { useState } from "react";
import bytes from "bytes";
import { useSubscriptions } from "../../hooks/useDB";
import { Subscription } from "../../types/definition";
import { t, vpnServiceManager } from "../../utils/helper";
import { AppleNetworkStatus, GoogleNetworkStatus } from "./network-check";
import SelectSub from "./select-config";
import SelectNode from "./select-node";

const formatDate = (prefix: string, date: number) => {
    if (date === 32503680000000) {
        // 是本地文件
        return t("local_file_no_expire")
    } else if (date === 0) {
        return t("never_expires")
    } else {
        return `${prefix} ${new Date(date).toLocaleDateString('zh-CN')}`
    }

};

export default function Body({ isRunning, onUpdate }: { isRunning: boolean, onUpdate: () => void }) {
    const [sub, setSub] = useState<Subscription>();
    const { data, isLoading } = useSubscriptions();
    const isLocalFile = sub?.expire_time === 32503680000000
    const trafficDetails = sub && !isLocalFile
        ? `${bytes(sub.used_traffic)} / ${bytes(sub.total_traffic)}`
        : ""

    const handleUpdate = async (identifier: string, isUpdate: boolean) => {
        try {
            setSub(data?.find(item => item.identifier === identifier));
            if (isUpdate && isRunning) {
                await vpnServiceManager.syncConfig({});
                onUpdate()
            }
        } catch (error) {
            console.error(t("update_config_failed") + ":", error);
        }
    };



    return (
        <div className='w-full h-full flex flex-col space-y-6 justify-between ' >
            <div>
                <div className="fieldset w-full">
                    <div className="fieldset-legend min-w-[270px]">
                        <div className="capitalize">
                            {
                                t("current_subscription")
                            }
                        </div>
                        <div className="flex gap-2 px-2 items-center">

                            <AppleNetworkStatus />
                            <GoogleNetworkStatus isRunning={isRunning} />
                        </div>
                    </div>
                    <SelectSub onUpdate={handleUpdate} data={data} isLoading={isLoading} />
                </div>
                <div className="fieldset w-full">
                    <div className="fieldset-legend min-w-[270px] capitalize">
                        {t("node_selection")}
                    </div>
                    <SelectNode isRunning={isRunning} />
                </div>
            </div>
            <div>
                {sub && (
                    <div className="w-full  ">
                        <div className="flex items-center justify-center mt-1">
                            <span className="text-xs text-blue-500 ">
                                {trafficDetails || '\u00A0'}
                            </span>
                        </div>

                        <div className="flex items-center justify-center mt-1">
                            <span className="text-xs text-blue-500 ">

                                {formatDate(t("expired_at"), sub.expire_time)}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
