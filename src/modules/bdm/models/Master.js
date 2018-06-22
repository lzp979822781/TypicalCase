import {actions} from 'mirrorx';
import * as api from "../services/Master";
import { Info,Error } from "utils";
import moment from 'moment';
/**
 * masterData主表数据
 * childData子表数据
 * searchFlag 为搜索框显示和隐藏标志
 * btnFlag 为按钮状态，新增、修改是可编辑，查看详情不可编辑，
 *          新增表格为空
 *          修改需要将行数据带上并显示在卡片页面
 *          查看详情携带行数据但是表格不可编辑
 *          0表示新增、1表示修改，2表示查看详情 3提交
 * rowData 为行数据字段
 * paginationParam为分页的请求参数
 * paginationRes为请求列表返回的分页信息如总页数、总数据条数
 * resFlag bpm模型是否启用
 */

export default {
    name : "master",
    initialState : {
        masterData: [],
        searchFlag:true,
        btnFlag:0,
        paginationParam:{
            pageIndex:0,
            pageSize:10,
            activePage:1
        },
        paginationRes:{
            totalElements:0,
            totalPages:0
        },
        // checkedArray:[],
        rowData:{}
    },
    reducers : {
        save(state, data) {
            return {
                ...state,
                ...data
            }
        }
    },
    effects : {
        async load(data,getState) {
            let paginationParam = getState().master.paginationParam;
            console.log("paginationParam",paginationParam)
            let reqParam = Object.assign({},data,paginationParam);
            let {data:{success,detailMsg:{data:{content,totalElements,totalPages}}}} = await api.get(reqParam);
            console.log("content",content);
            if(content){
                content = content.map((item,index)=>{
                    // console.log("applyTime",moment(item.applyTime).format('YYYY-MM-DD HH:mm:ss'));
                    return Object.assign({},item,{"applyTime":moment(item.applyTime).format('YYYY-MM-DD HH:mm:ss')});
                })
            }
            let tempState = {
                masterData:[],
                paginationRes:{
                    totalElements:totalElements,
                    totalPages:totalPages
                }
            }
            if (success=="success") {
                tempState.masterData = content;
                actions.master.save(tempState);
                
            }else{
                Error('数据请求失败');
            }
            // done表示数据加载完成，不管成功或者失败
            return {"done":true};
        },
        /* clear(){
            actions.master.save({masterData:[]});
            Info("数据清除完毕");
        }, */
        async rowClick(data,getState){
            let search_fk_id_ygdemo_yw_sub = data["id"]?data["id"]:"";
            let param = {
                search_fk_id_ygdemo_yw_sub
            }
            let {data:{success,detailMsg:{data:{content}}}} = await api.getChildList(param);
            console.log("data",data);
            console.log("content",content)
            let tempState = {
                childData:[],
            }
            if (success=="success") {
                console.log("成功获取数据");
                tempState.childData = content;
                actions.master.save(tempState);
            }else{
                Error('数据请求失败');
            }

        },
        async changePage(data,getState){
            console.log(data);
            actions.master.save(data);
        },
        /* async edit(data,getState){
            let { data : { success } } = await api.edit(data);
            if (success) {
                actions.master.load();
            }
        }, */
        
        async remove(data,getState){
            let { data : { success } } = await api.remove(data);
            if (success=="success") {
                
                return {"done":true};
            }else {
                return {"done":false,"message":success||"删除异常"}
            }
        },

        async onSave(data,getState){
            // 添加数据应该提交到服务器上
            console.log("addMasterData",data);
            let result = await api.save(data);
            console.log(JSON.stringify(result));
            let {data:{success}} = result;
            if(success=="success") {
                // 添加成功后，提示保存成功
                return {"done":true};
            }
            console.log("addMasterData",success)
        },

        // 提交数据
       /*  async onCommit(data,getState) {
            // 先去查询是否启动了bpm流程，如果没有启动则直接进行提交，如果已经启动则提示已
            let {funccode,nodekey} = data;
            let bpmParam = {
                funccode :funccode,
                nodekey : nodekey
            }
            let { data : { success,detailMsg } } = await api.queryBpm(bpmParam);
            
            if (success=="success") {
                let commitParam = {
                    "processDefineCode":detailMsg["data"]["res_code"],
                    "submitArray":data["submitArray"]
                }
                //commit提交后，返回success状态显示fail_global
                let result = await api.onCommit(commitParam);
                console.log("result",result);
                let flag = result["data"]["success"];
                console.log("flag",flag);
                if(flag=="success"){
                    await actions.master.load();
                    return {'done':true};
                }
            }else if(success=="fail_global") {
                let {data:{message}} = result
                return {'done':false,"message":message};
            }
        }, */

        // 撤回 recallFlag为1表示撤回成功
        /* async onRecall(data,getState) {
            let {data:{success,message}} = await api.onRecall(data);
            if(success=="success"){
                await actions.master.load();
                return {'done':true};
            }else if(success=="fail_global") {
                return {
                    'done':false,
                    'message':message
                }
            }
        } */
    }
}