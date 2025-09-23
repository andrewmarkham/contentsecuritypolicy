import React, { useContext, useEffect, useState, useRef } from "react";

import { Button, Divider, Form, Skeleton, Space, Tabs, Checkbox, Upload, Table, Popconfirm, Tooltip } from 'antd';
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import type { TabsProps, UploadFile, UploadProps } from 'antd';
import type { CheckboxOptionType } from 'antd/es/checkbox';

import { WebHooksUi } from "./Webhooks/WebHooksUi";
import { ApiKeys } from "./ApiKeys/ApiKeys";
import { AuthenticationKey, SecuritySettings } from "../csp/types/types";
import { AppContext } from "../../context";
import { Toaster } from "../toaster";
import { RcFile, UploadChangeParam } from "antd/es/upload/interface";
import LoadingOutlined from "@ant-design/icons/lib/icons/LoadingOutlined";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import ImportOutlined from "@ant-design/icons/lib/icons/ImportOutlined";

type Props = {
    settings: SecuritySettings,
    handleUpdate: (settings: SecuritySettings) => void
}

export function ImportExport() {

    const { state, dispatch } = useContext(AppContext);

    useEffect(() => {
        console.log("dispatch called")
        dispatch({ state: state.settings, actionType: "settingsLoad", dispatcher: dispatch })
    }, []);

    return (

        <>
            <Toaster show={state.settings.loading || state.settings.saving} message={state.settings.loading ? "Loading..." : "Saving..."} />
            <HandleExport />
            <HandleImport />
        </>
    )
}

function HandleExport() {


    var exportOptions: CheckboxOptionType[] =[
        { label: 'Export CSP', value: 'csp' },
        { label: 'Export Headers', value: 'headers' },
        { label: 'Export Settings', value: 'settings' }
    ];

    const [form] = Form.useForm();
    const [hasOptions, setHasOptions] = useState<boolean>(false);

    return (

        <>
            <Form
                name="exportForm"
                form={form}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 800 }}
                onFinish={(values) => {

                    fetch('/api/jhoose/settings/export', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(values),
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.blob();
                    })
                    .then(blob => {
                        const url = window.URL.createObjectURL(new Blob([blob]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `jhoose-security-export.json`);
                        document.body.appendChild(link);
                        link.click();
                        link.parentNode?.removeChild(link);
                    })
                    .catch(error => {
                        console.error('There was a problem with the fetch operation:', error);
                    });
                }}
                onFieldsChange={(_, allFields) => {
                    const optionsField = allFields.find(field => field.name && field.name[0] === "options");
                    optionsField && Array.isArray(optionsField.value) && optionsField.value.length > 0
                        ? setHasOptions(true)
                        : setHasOptions(false);
                }}
                autoComplete="off">

                <Divider orientation="left">Export</Divider>
                <p>Please select the options you want to export:</p>
                <Form.Item
                    label="Options" 
                    name="options">
                        
                    <Checkbox.Group options={exportOptions}
                    />
                </Form.Item>

                <Space className="toolBar">
                    <Button type="primary" 
                            htmlType="submit" 
                            disabled={!hasOptions}>
                        Export
                    </Button>
                </Space>

            </Form>
        </>
    )
}


function HandleImport() {
    const [reloadFlag, setReloadFlag] = useState(0);

    // This function will be passed to children to trigger reload
    const reloadFiles = () => setReloadFlag(f => f + 1);

    return (
        <div style={{ maxWidth: 800, marginTop: 20 }}>
            <Divider orientation="left">Import</Divider>
            <ListUploadedFiles reloadFlag={reloadFlag} />
            <UploadFile onUpload={reloadFiles} />
        </div>
    );
}



const UploadFile = ({ onUpload }: { onUpload: () => void }) => {
    const [dragActive, setDragActive] = useState(false);
    const [importJson, setImportJson] = useState<any>(null);
    const [fileName, setFileName] = useState<string>("");
    const [processing, setProcessing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

        const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            setDragActive(false);
            const file = event.dataTransfer.files?.[0];
            if (!file) return;
            if (file.type !== "application/json") {
                alert("Please select a JSON file!");
                return;
            }
            setFileName(file.name);
            const text = await file.text();
            try {
                setImportJson(JSON.parse(text));
            } catch (err) {
                alert("Invalid JSON file.");
                setImportJson(null);
            }
        };

        const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            setDragActive(true);
        };

        const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            setDragActive(false);
        };

        const handleClick = () => {
            inputRef.current?.click();
        };

        const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (file.type !== "application/json") {
                alert("Please select a JSON file!");
                return;
            }
            setFileName(file.name);
            const text = await file.text();
            try {
                setImportJson(JSON.parse(text));
            } catch (err) {
                alert("Invalid JSON file.");
                setImportJson(null);
            }
        };

        const handleImport = () => {
            if (!importJson) {
                alert("No valid JSON file selected.");
                return;
            }
            setProcessing(true);
            fetch('/api/jhoose/settings/uploadimport', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(importJson),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
            })
            .then(() => {
                if (onUpload) onUpload();
                setFileName("");
                setImportJson(null);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                alert("Import failed. See console for details.");
            })
            .finally(() => {
                setProcessing(false);
            });
        };

        return (
            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={{
                    border: dragActive ? "2px dashed #1890ff" : "2px dashed #ccc",
                    background: dragActive ? "#e6f7ff" : "#fafafa",
                    padding: "32px",
                    textAlign: "center",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "border-color 0.2s, background 0.2s",
                    marginBottom: "16px",
                    position: "relative"
                }}
                aria-label="Drop zone for file upload"
                tabIndex={0}
            >
                <input
                    type="file"
                    accept=".json,application/json"
                    ref={inputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />
                <div style={{ fontSize: "1.2em", color: dragActive ? "#1890ff" : "#888" }}>
                    {dragActive ? "Drop your JSON file here" : "Drag & drop a JSON file here, or click to select"}
                </div>
                {fileName && (
                    <>
                        <div style={{ marginTop: "12px", color: "#555" }}>
                            <strong>Selected file:</strong> {fileName}
                        </div>
                        <button
                            type="button"
                            style={{ zIndex: 100, marginTop: "18px", padding: "8px 24px", borderRadius: "4px", background: "#1890ff", color: "#fff", border: "none", fontWeight: "bold", cursor: importJson ? "pointer" : "not-allowed" }}
                            onClick={e => { e.stopPropagation(); handleImport(); }}
                            disabled={!importJson || processing}
                        >
                            {processing ? (
                                <span>
                                    <LoadingOutlined style={{ marginRight: 8 }} /> Processing...
                                </span>
                            ) : (
                                "Upload File"
                            )}
                        </button>
                    </>
                )}
                {processing && (
                    <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(255,255,255,0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2em",
                        color: "#1890ff",
                        zIndex: 200
                    }}>
                        <LoadingOutlined style={{ marginRight: 8 }} /> Importing...
                    </div>
                )}
            </div>
        );
    };


const ListUploadedFiles = ({ reloadFlag }: { reloadFlag: number }) => {
    const [files, setFiles] = useState<JhoooseSecurityExport[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [toaster, setToaster] = useState<{ show: boolean; message: string; type: 'success' | 'error' | undefined }>({ show: false, message: '', type: undefined });

    useEffect(() => {
        if (toaster.show) {
            const timer = setTimeout(() => {
                setToaster({ show: false, message: '', type: undefined });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [toaster.show]);

    useEffect(() => {
        getImportFiles();
    }, [reloadFlag]);

    function getImportFiles() {
        setLoading(true);
        fetch('/api/jhoose/settings/listimports', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            setFiles(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        })
        .finally(() => setLoading(false));
    }

    const handleDelete = (id: string) => {
        fetch(`/api/jhoose/settings/import/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Delete failed');
            }
            setFiles(prev => prev.filter(f => f.id !== id));
        })
        .catch(error => {
            console.error('Delete error:', error);
            alert('Failed to delete import.');
        });
    };

    const handleRunImport = (id: string) => {
        fetch(`/api/jhoose/settings/import/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Import failed');
            }
            setToaster({ show: true, message: 'Import started successfully.', type: 'success' });
            getImportFiles();
        })
        .catch(error => {
            console.error('Import error:', error);
            setToaster({ show: true, message: 'Failed to run import.', type: 'error' });
        });
    };

    const columns = [
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (value: string) => new Date(value).toLocaleString(),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: JhoooseSecurityExport) => (
                <Space>
                    <Popconfirm
                        title="Apply this import?"
                        description="This will apply the exported settings."
                        okText="Import"
                        cancelText="Cancel"
                        onConfirm={() => handleRunImport(record.id)}
                    >
                        <Button type="primary" color="primary" icon={<ImportOutlined />}>Import</Button>
                    </Popconfirm>
                    <Popconfirm
                        title="Delete this import?"
                        description="This cannot be undone."
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                        cancelText="Cancel"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Tooltip title="Delete">
                            <Button
                                danger
                                size="small"
                                shape="circle"
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <>
            {toaster.show && (
                <Toaster
                    show={toaster.show}
                    message={toaster.message}
                />
            )}
            <Table
                rowKey={(record) => record.id}
                size="small"
                columns={columns}
                dataSource={files}
                loading={loading}
                pagination={false}
                style={{ marginTop: 10 }}
            />
        </>
    );
};

interface JhoooseSecurityExport {
    id: string;
    createdAt: string;
    status: string;
    seralizedExport: string;
}
