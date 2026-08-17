---
date: 2026-06-03
title: MAI-Thinking-1, MAI-Code-1-Flash
slug: mai
---
| **Benchmark**          | **MAI-Thinking-1** | **MAI-Code-1-Flash** |        **Claude Haiku 4.5** |             **Sonnet 4.6** |               **Opus 4.6** |                  **Kimi K2.6** |                              **GLM-5.1** |
| ---------------------- | -----------------: | -------------------: | --------------------------: | -------------------------: | -------------------------: | -----------------------------: | ---------------------------------------: |
| SWE-Bench Pro          |               52.8 |                 51.2 |                        35.2 |                          - |                       53.4 |                       **58.6** |                                     58.4 |
| SWE-Bench Verified     |               73.5 |                 71.6 |                        66.6 |                       79.6 |                   **80.8** |                           80.2 |                                        - |
| SWE-Bench Multilingual |                  - |                 65.5 |                        62.7 |                       75.9 |                   **77.8** |                           76.7 |                                        - |
| AIME 2025              |               97.0 |                    - | 80.7 no tools / 96.3 Python |                       95.6 |                   **99.8** |                              - |                                        - |
| AIME 2026              |               94.5 |                 92.5 |                        83.3 |                          - |                          - |                       **96.4** |                                     95.3 |
| HMMT Feb 2026          |               84.9 |                    - |                           - |                          - |                          - |                       **92.7** |                                     82.6 |
| GPQA Diamond           |               84.2 |                 84.6 |                        73.2 |                       89.9 |                   **91.3** |                           90.5 |                                     86.2 |
| LCB v6                 |               87.7 |                    - |                           - |                          - |                          - |                       **89.6** |                                        - |
| AMO Bench              |                  - |             **40.0** |                        16.0 |                          - |                          - |                              - |                                        - |
| Frontier Math          |                  - |              **6.3** |                         2.8 |                          - |                          - |                              - |                                        - |
| HLE                    |                  - |                 18.0 |                         9.5 | 33.2 no tools / 49.0 tools | 40.0 no tools / 53.0 tools | 34.7 no tools / **54.0 tools** |               31.0 no tools / 52.3 tools |
| Frontier Science       |                  - |             **58.2** |                        42.3 |                          - |                          - |                              - |                                        - |
| Artifacts Bench        |                  - |                 36.4 |                    **36.6** |                          - |                          - |                              - |                                        - |
| Terminal-Bench 2.0     |               46.0 |                 54.8 |                        41.6 |                       59.1 |                       65.4 |                           66.7 | 63.5 Terminus-2 / **69.0 self-reported** |
| IF Bench               |                  - |             **75.0** |                        46.1 |                          - |                          - |                              - |                                        - |
| Advanced IF            |                  - |             **71.4** |                        56.9 |                          - |                          - |                              - |                                        - |
| Robust IF Bench        |                  - |             **61.2** |                        45.0 |                          - |                          - |                              - |                                        - |
| τ²-Bench               |                  - |             **71.7** |                        54.7 |                          - |                          - |                              - |                                        - |

## Sources

- Microsoft AI, **MAI-Thinking-1 technical report**, for MAI-Thinking-1 scores and several comparison values. ([Microsoft AI](https://microsoft.ai/wp-content/uploads/2026/06/main_20260602_2.pdf?utm_source=chatgpt.com "MAI-Thinking-1: Building a Hill-Climbing Machine - Microsoft AI"))
- Microsoft AI, **Introducing MAI-Thinking-1**, for headline AIME 2025 and AIME 2026 values. ([Microsoft AI](https://microsoft.ai/news/introducing-mai-thinking-1/?utm_source=chatgpt.com "Introducing MAI-Thinking-1 | Microsoft AI")
- Microsoft AI, **Introducing MAI-Code-1-Flash**, for MAI-Code-1-Flash vs Claude Haiku 4.5 benchmark values. ([Microsoft AI](https://microsoft.ai/news/introducingmai-code-1-flash/?utm_source=chatgpt.com "Introducing MAI-Code-1-Flash - Microsoft AI"))
- Anthropic, **Claude Haiku 4.5 announcement**, for official Haiku context and Anthropic-reported SWE-Bench Verified score caveat. ([Anthropic](https://www.anthropic.com/news/claude-haiku-4-5?utm_source=chatgpt.com "Introducing Claude Haiku 4.5"))
- Anthropic, **Claude Sonnet 4.6 System Card**, for Sonnet 4.6 SWE-Bench Verified and SWE-Bench Multilingual values. ([Anthropic](https://anthropic.com/claude-sonnet-4-6-system-card?utm_source=chatgpt.com "Claude Sonnet 4.6 System Card"))
- Anthropic, **Claude Opus 4.6 System Card**, for Opus 4.6 SWE-Bench Verified and SWE-Bench Multilingual values. ([Anthropic](https://www-cdn.anthropic.com/0dd865075ad3132672ee0ab40b05a53f14cf5288.pdf?utm_source=chatgpt.com "Claude Opus 4.6 System Card"))
- Moonshot AI, **Kimi K2.6 Tech Blog / Model Card**, for Kimi K2.6 benchmark values. ([Kimi](https://www.kimi.com/blog/kimi-k2-6?utm_source=chatgpt.com "Kimi K2.6 Tech Blog: Advancing Open-Source Coding"))
	- Z.ai, **GLM-5.1: Towards Long-Horizon Tasks**, and ModelScope GLM-5.1 card, for GLM-5.1 values. ([Z.ai](https://z.ai/blog/glm-5.1?utm_source=chatgpt.com "GLM-5.1: Towards Long-Horizon Tasks"))
- Terminal-Bench official leaderboard, for Terminal-Bench 2.0 reference leaderboard context. ([tbench.ai](https://www.tbench.ai/leaderboard/terminal-bench/2.0?utm_source=chatgpt.com "terminal-bench@2.0 Leaderboard"))