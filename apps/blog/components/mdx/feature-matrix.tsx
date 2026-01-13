import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@duyet/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@duyet/components/ui/card';

interface Feature {
  name: string;
  description?: string;
}

interface Tool {
  name: string;
  features: Record<string, boolean | string>;
}

interface FeatureMatrixProps {
  features: Feature[];
  tools: Tool[];
}

export function FeatureMatrix({ features, tools }: FeatureMatrixProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>功能矩阵</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">功能</TableHead>
                {tools.map((tool, index) => (
                  <TableHead key={index} className="text-center">
                    {tool.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map((feature, featureIndex) => (
                <TableRow key={featureIndex}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{feature.name}</div>
                      {feature.description && (
                        <div className="text-sm text-muted-foreground">
                          {feature.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {tools.map((tool, toolIndex) => {
                    const value = tool.features[feature.name];
                    let displayValue: React.ReactNode;

                    if (typeof value === 'boolean') {
                      displayValue = value ? (
                        <span className="text-green-600 font-semibold">✓</span>
                      ) : (
                        <span className="text-red-600 font-semibold">✗</span>
                      );
                    } else {
                      displayValue = <span className="text-blue-600">{value}</span>;
                    }

                    return (
                      <TableCell key={toolIndex} className="text-center">
                        {displayValue}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}