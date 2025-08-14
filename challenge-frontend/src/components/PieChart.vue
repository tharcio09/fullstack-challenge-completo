<template>
  <div class="chart-container" ref="containerRef">
    <canvas ref="canvasRef"></canvas>
    <!-- Tooltip personalizado para legendas -->
    <div 
      v-if="tooltipVisible" 
      class="legend-tooltip"
      :style="tooltipStyle"
    >
      {{ tooltipText }}
    </div>
  </div>
</template>

<script>
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { onMounted, ref, watch, onBeforeUnmount } from "vue";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

export default {
  name: "PieChart",
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const canvasRef = ref(null);
    const containerRef = ref(null);
    const tooltipVisible = ref(false);
    const tooltipText = ref('');
    const tooltipStyle = ref({});
    let chartInstance = null;
    let resizeObserver = null;

    // Função para determinar a configuração da legenda baseada no tamanho da tela
    const getLegendConfig = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        // Mobile: legenda embaixo, fonte menor
        return {
          position: 'bottom',
          align: 'center',
          font: { size: 12, weight: 'bold' },
          padding: 15,
          labels: {
            usePointStyle: true,
            padding: 15,
            boxWidth: 15,
            boxHeight: 15,
          }
        };
      } else {
        // Desktop e Tablet: legenda à direita, sem truncamento
        return {
          position: 'right',
          align: 'center',
          font: { size: 13, weight: 'bold' },
          padding: 20,
          labels: {
            usePointStyle: true,
            padding: 18,
            boxWidth: 14,
            boxHeight: 14,
          }
        };
      }
    };

    // Função para truncar texto longo (só em mobile)
    const truncateText = (text, maxLength = 20) => {
      if (window.innerWidth >= 768) return text; // Não truncar em desktop
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    // Função para mostrar tooltip
    const showTooltip = (event, text) => {
      const rect = containerRef.value.getBoundingClientRect();
      tooltipText.value = text;
      tooltipStyle.value = {
        left: (event.clientX - rect.left + 10) + 'px',
        top: (event.clientY - rect.top - 30) + 'px',
      };
      tooltipVisible.value = true;
    };

    // Função para esconder tooltip
    const hideTooltip = () => {
      tooltipVisible.value = false;
    };

    const renderChart = () => {
      if (!canvasRef.value) return;
      
      if (chartInstance) chartInstance.destroy();
      
      try {
        const legendConfig = getLegendConfig();
        
        chartInstance = new Chart(canvasRef.value, {
          type: "doughnut",
          data: props.data,
          options: {
            layout: { 
              padding: legendConfig.position === 'right' 
                ? { right: 140, top: 0, bottom: 0, left: 0 } 
                : { top: 0, bottom: 80, left: 0, right: 0 }
            },
            responsive: true,
            maintainAspectRatio: false,
            cutout: "55%",
            plugins: {
              legend: {
                display: true,
                position: legendConfig.position,
                align: legendConfig.align,
                fullsize: false,
                labels: {
                  ...legendConfig.labels,
                  font: legendConfig.font,
                  generateLabels: (chart) => {
                    const data = chart.data;
                    if (data.labels.length && data.datasets.length) {
                      return data.labels.map((label, i) => {
                        const meta = chart.getDatasetMeta(0);
                        const style = meta.controller.getStyle(i);
                        const truncatedLabel = truncateText(label);
                        
                        return {
                          text: truncatedLabel,
                          fillStyle: style.backgroundColor,
                          strokeStyle: style.borderColor,
                          lineWidth: style.borderWidth,
                          pointStyle: 'rectRounded',
                          hidden: !chart.getDataVisibility(i),
                          index: i,
                        };
                      });
                    }
                    return [];
                  },
                },
                onClick: (event, legendItem, legend) => {
                  // Toggle visibility do item da legenda
                  const index = legendItem.index;
                  const ci = legend.chart;
                  const meta = ci.getDatasetMeta(0);
                  
                  meta.data[index].hidden = !meta.data[index].hidden;
                  ci.update();
                }
              },
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    const label = props.data.labels[tooltipItem.dataIndex] || "";
                    const value = props.data.datasets[0].data[tooltipItem.dataIndex] || 0;
                    return `${label}: ${value}%`;
                  },
                },
              },
            },
            elements: {
              arc: {
                borderWidth: 2,
                borderColor: "#ffffff",
              },
            },
          },
          plugins: [
            {
              id: "colorfulLegendText",
              beforeDraw(chart) {
                if (chart.legend && chart.legend.legendItems) {
                  chart.legend.legendItems.forEach((item, i) => {
                    if (chart.data.datasets[0] && chart.data.datasets[0].backgroundColor[i]) {
                      item.fontColor = chart.data.datasets[0].backgroundColor[i];
                    }
                  });
                }
              },
            },
            {
              id: "responsiveLegend",
              beforeDraw(chart) {
                if (chart.legend && chart.legend.legendItems) {
                  const legendConfig = getLegendConfig();
                  chart.legend.legendItems.forEach((item) => {
                    item.pointStyleWidth = legendConfig.labels.boxWidth;
                    item.pointStyleHeight = legendConfig.labels.boxHeight;
                  });
                }
              },
            },
          ],
        });

        // Adicionar event listeners para tooltips na legenda
        const canvas = canvasRef.value;
        canvas.addEventListener('mousemove', (event) => {
          const rect = canvas.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          
          // Verificar se o mouse está sobre a área da legenda
          if (chartInstance.legend && chartInstance.legend.legendItems) {
            chartInstance.legend.legendItems.forEach((item, index) => {
              // Lógica simplificada para detectar hover na legenda
              const legendArea = chartInstance.legend.legendHitBoxes[index];
              if (legendArea && 
                  x >= legendArea.left && x <= legendArea.right &&
                  y >= legendArea.top && y <= legendArea.bottom) {
                const originalLabel = props.data.labels[index];
                if (originalLabel && originalLabel.length > (window.innerWidth < 768 ? 15 : 25)) {
                  showTooltip(event, originalLabel);
                  return;
                }
              }
            });
          }
          hideTooltip();
        });

        canvas.addEventListener('mouseleave', hideTooltip);

      } catch (error) {
        console.error('Erro ao renderizar gráfico:', error);
      }
    };

    let resizeTimeout = null;

    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        renderChart();
      }, 300);
    };

    onMounted(() => {
      renderChart();
      resizeObserver = new ResizeObserver(handleResize);
      if (containerRef.value) {
        resizeObserver.observe(containerRef.value);
      }
    });

    watch(() => props.data, renderChart, { deep: true });

    onBeforeUnmount(() => {
      if (chartInstance) chartInstance.destroy();
      if (resizeObserver && containerRef.value) {
        resizeObserver.unobserve(containerRef.value);
      }
      if (resizeTimeout) clearTimeout(resizeTimeout);
    });

    return { 
      canvasRef, 
      containerRef, 
      tooltipVisible, 
      tooltipText, 
      tooltipStyle 
    };
  },
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
  position: relative;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

.legend-tooltip {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  z-index: 1000;
  pointer-events: none;
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.8);
}

/* Media queries para melhorar responsividade */
@media (max-width: 768px) {
  .chart-container {
    min-height: 320px;
  }
  
  .legend-tooltip {
    font-size: 11px;
    padding: 6px 10px;
    max-width: 150px;
  }
}

@media (max-width: 480px) {
  .chart-container {
    min-height: 280px;
  }
  
  .legend-tooltip {
    font-size: 10px;
    padding: 5px 8px;
    max-width: 120px;
  }
}
</style>
