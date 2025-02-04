import React, { useState } from "react";
import { CircuitBoard, Tag, BookOpen } from '@tamagui/lucide-icons';
import { DeviceDefinitionModel } from './deviceDefinitionsSchemas';
import { API, Chip, DataTable2, DataView, ButtonSimple, AlertDialog, Center, AdminPage, PaginatedDataSSR } from 'protolib'
import { z } from 'protolib/base'
import { DeviceBoardModel } from '../deviceBoards';
import { DeviceCoreModel } from '../devicecores';
import { Spinner, XStack } from "tamagui";
import dynamic from 'next/dynamic'
import { useThemeSetting } from '@tamagui/next-theme'
import { getPendingResult } from "protolib/base";
import { usePendingEffect } from "protolib";
import { Flows } from "protolib";
import { getFlowMasks, getFlowsCustomComponents } from "app/bundles/masks";
import { useRouter } from 'next/router'

const DeviceDefitionIcons = {
  name: Tag,
  board: CircuitBoard
}

const sourceUrl = '/adminapi/v1/devicedefinitions'
const boardsSourceUrl = '/adminapi/v1/deviceboards?all=1'
const coresSourceUrl = '/adminapi/v1/devicecores?all=1'

export default {
  component: ({ workspace, pageState, initialItems, itemData, pageSession, extraData }: any) => {
    const [showDialog, setShowDialog] = React.useState(false)
    const [isSaveActive, setIsSaveActive] = React.useState(false);
    const { resolvedTheme } = useThemeSetting();
    const defaultJsCode = { "components": "[\n \"mydevice\",\n \"esp32dev\",\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n null,\n];\n\n" }
    const [sourceCode, setSourceCode] = useState(defaultJsCode.components)
    // const [isModified,setIsModified] = React.useState(false)
    const [editedObjectData, setEditedObjectData] = React.useState({})
    const router = useRouter()

    const saveToFile = (code, path) => {
      editedObjectData.setData({ components: code, sdkConfig: { board: "esp32dev", framework: { type: "arduino" } } })
    }

    const [boardList, setBoardList] = useState(extraData?.boards ?? getPendingResult('pending'))
    usePendingEffect((s) => { API.get({ url: boardsSourceUrl }, s) }, setBoardList, extraData?.deviceDefinitions)
    const boards = boardList.isLoaded ? boardList.data.items.map(i => DeviceBoardModel.load(i).getData()) : []

    const [coresList, setCoresList] = useState(extraData?.cores ?? getPendingResult('pending'))
    usePendingEffect((s) => { API.get({ url: coresSourceUrl }, s) }, setCoresList, extraData?.cores)
    const cores = coresList.isLoaded ? coresList.data.items.map(i => DeviceCoreModel.load(i).getData()) : []

    return (<AdminPage title="Device Definitions" workspace={workspace} pageSession={pageSession}>
      <AlertDialog open={showDialog} setOpen={(open) => { setShowDialog(open) }} hideAccept={true} style={{ width: "80%", height: "80%", padding: '0px', overflow: 'hidden' }}>
        {/* <Center style={{minWidth: "80%" }}> */}
        <XStack f={1} minWidth={"100%"}>
          <Flows
            style={{ width: "100%" }}
            disableDots={true}
            onSave={isSaveActive
              ? (o) => {
                console.log("ON SAVE: ", o);
                saveToFile(o, "a")
              } : null}
            hideBaseComponents={true}
            disableStart={true}
            getFirstNode={(nodes) => {
              return nodes.find(n => n.type == 'ArrayLiteralExpression')
            }}
            showActionsBar={isSaveActive}
            mode={"device"}
            customComponents={getFlowsCustomComponents(router.pathname, router.query)}
            bridgeNode={false}
            setSourceCode={(sourceCode) => {
              console.log('set new sourcecode from flows: ', sourceCode)
              setSourceCode(sourceCode)
            }}
            sourceCode={sourceCode}
            themeMode={resolvedTheme}
            key={'flow'}
            config={{ masks: getFlowMasks(router.pathname, router.query), layers: [] }}
            bgColor={'transparent'}
            dataNotify={(data: any) => {
              if (data.notifyId) {
                //mqttPub('datanotify/' + data.notifyId, JSON.stringify(data))
              }
            }}
            positions={[]}
            disableSideBar={true}
            // store={uiStore}
            display={true}
            flowId={"flows-editor"}
          />
          {/* </Center> */}
        </XStack>
      </AlertDialog>

      <DataView
        integratedChat
        entityName={"devicedefinitions"}
        itemData={itemData}
        rowIcon={BookOpen}
        sourceUrl={sourceUrl}
        initialItems={initialItems}
        numColumnsForm={1}
        name="Definition"
        onAdd={data => { console.log("DATA (onAdd): ", data); return data }}
        onEdit={data => { console.log("DATA (onEdit): ", data); return data }}
        columns={DataTable2.columns(
          DataTable2.column("name", "name", true),
          DataTable2.column("board", "board", true, (row) => <Chip text={row.board} color={'$gray5'} />),
          DataTable2.column("sdk", "sdk", true, (row) => <Chip text={row.sdk} color={'$gray5'} />),
          DataTable2.column("config", "config", false, (row) => <ButtonSimple onPress={async (e) => { console.log("row from Edit: ", row); setIsSaveActive(false); setShowDialog(true); setSourceCode(row.config.components); }}>View</ButtonSimple>)
        )}
        extraFieldsForms={{
          board: z.union(boards.map(o => z.literal(o.name))).after('name'),
          sdk: z.union([z.any(), z.any()]).dependsOn("board").generateOptions((formData) => {
            if (formData.board) {
              const board = boards.find(brd => brd.name === formData.board)
              return cores.find(core => core.name === board.core).sdks
            }
            return []
          }).after("name"),
        }}
        model={DeviceDefinitionModel}
        pageState={pageState}
        icons={DeviceDefitionIcons}
        dataTableGridProps={{ itemMinWidth: 300, spacing: 20 }}
        customFields={{
          'config': {
            component: (path, data, setData, mode) => {
              console.log("inputs: ", { path, data, setData, mode })
              if (mode == "preview") { return <></> }
              return <ButtonSimple onPress={(e) => { setShowDialog(true); setIsSaveActive(true); mode == "add" ? setSourceCode(defaultJsCode.components) : setSourceCode(data.components); setEditedObjectData({ path, data, setData, mode }); console.log("inputs: ", { path, data, setData, mode }) }}>Edit</ButtonSimple>
            },
            hideLabel: false
          }
        }}
      />
    </AdminPage>)
  },
  getServerSideProps: PaginatedDataSSR(sourceUrl, ['admin'], {}, async () => {
    return {
      boards: await API.get(boardsSourceUrl),
      cores: await API.get(coresSourceUrl)
    }
  })
}