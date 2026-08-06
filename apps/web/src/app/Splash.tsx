'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface SplashProps {
  onClick?: () => void;
  onStartTransition?: () => void;
  onComplete?: () => void;
}

// ─── High Performance Cubic Bezier Solver (.22, 1, .36, 1) ───
function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  return function (t: number): number {
    const cx = 3 * p1x;
    const bx = 3 * (p2x - p1x) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * p1y;
    const by = 3 * (p2y - p1y) - cy;
    const ay = 1 - cy - by;
    let sampleT = t;
    for (let i = 0; i < 5; i++) {
      const x = ((ax * sampleT + bx) * sampleT + cx) * sampleT;
      const dx = (3 * ax * sampleT + 2 * bx) * sampleT + cx;
      if (Math.abs(dx) < 1e-6) break;
      sampleT -= (x - t) / dx;
    }
    return ((ay * sampleT + by) * sampleT + cy) * sampleT;
  };
}

const easeOrganic = cubicBezier(0.22, 1, 0.36, 1);

// ─── Individual Letter Paths ───
// "WELCOME TO"
const WELCOME_LETTERS = [
  { id: 'w1', d: 'M201.115 586H189.115L173.29 529.75H185.29L195.115 564.775L199.015 551.05L193.015 529.75H205.015L214.84 564.7L224.74 529.75H236.74L220.84 586H208.84L205.015 572.35L201.115 586Z', cx: 205, cy: 558 },
  { id: 'e1', d: 'M279.633 586H251.883C241.308 586 236.058 581.275 236.058 571.525C236.058 562.825 240.333 558.025 248.883 557.2C243.333 555.55 240.558 551.125 240.558 543.85C240.558 534.325 245.283 529.75 254.733 529.75H279.633V541.75H258.333C255.633 541.75 254.058 543.925 254.058 546.625C254.058 549.1 255.633 551.575 258.333 551.575H273.633V563.425H254.058C251.133 563.425 249.558 566.05 249.558 568.825C249.558 571.75 251.133 574 254.058 574H279.633V586Z', cx: 257, cy: 558 },
  { id: 'l1', d: 'M283.373 586V529.75H295.373V574H316.448V586H283.373Z', cx: 300, cy: 558 },
  { id: 'c1', d: 'M357.618 570.325L366.093 579.325C361.218 584.5 354.243 587.5 345.843 587.5C329.043 587.5 317.943 575.65 317.943 557.875C317.943 540.1 329.043 528.25 345.843 528.25C354.243 528.25 361.218 531.25 366.093 536.425L357.618 545.425C354.543 541.9 350.193 540.325 345.918 540.325C337.893 540.325 330.168 545.35 330.168 557.875C330.168 570.4 337.893 575.425 345.918 575.425C350.193 575.425 354.543 573.85 357.618 570.325Z', cx: 342, cy: 558 },
  { id: 'o1', d: 'M394.111 575.425C401.686 575.425 409.786 570.4 409.786 557.875C409.786 545.35 401.686 540.325 394.111 540.325C386.086 540.325 378.361 545.35 378.361 557.875C378.361 570.4 386.086 575.425 394.111 575.425ZM366.136 557.875C366.136 540.1 377.236 528.25 394.036 528.25C410.836 528.25 421.936 540.1 421.936 557.875C421.936 575.65 410.836 587.5 394.036 587.5C377.236 587.5 366.136 575.65 366.136 557.875Z', cx: 394, cy: 558 },
  { id: 'm1', d: 'M459.037 529.75H471.037L486.862 586H474.862L465.037 550.975L461.137 564.7L467.137 586H455.137L445.312 551.05L435.412 586H423.412L439.312 529.75H451.312L455.137 543.4L459.037 529.75Z', cx: 455, cy: 558 },
  { id: 'e2', d: 'M534.223 586H506.473C495.898 586 490.648 581.275 490.648 571.525C490.648 562.825 494.923 558.025 503.473 557.2C497.923 555.55 495.148 551.125 495.148 543.85C495.148 534.325 499.873 529.75 509.323 529.75H534.223V541.75H512.923C510.223 541.75 508.648 543.925 508.648 546.625C508.648 549.1 510.223 551.575 512.923 551.575H528.223V563.425H508.648C505.723 563.425 504.148 566.05 504.148 568.825C504.148 571.75 505.723 574 508.648 574H534.223V586Z', cx: 512, cy: 558 },
  { id: 't1', d: 'M583.817 586V541.75H567.992V529.75H611.642V541.75H595.817V586H583.817Z', cx: 589, cy: 558 },
  { id: 'o2', d: 'M641.89 575.425C649.465 575.425 657.565 570.4 657.565 557.875C657.565 545.35 649.465 540.325 641.89 540.325C633.865 540.325 626.14 545.35 626.14 557.875C626.14 570.4 633.865 575.425 641.89 575.425ZM613.915 557.875C613.915 540.1 625.015 528.25 641.815 528.25C658.615 528.25 669.715 540.1 669.715 557.875C669.715 575.65 658.615 587.5 641.815 587.5C625.015 587.5 613.915 575.65 613.915 557.875Z', cx: 641, cy: 558 },
];

// "A TRUSTED PARTNER OF JAXMART"
const TAGLINE_LETTERS = [
  { id: 'tag1', d: 'M1544.12 514L1541.56 506.935H1527.38L1524.82 514H1520.36L1532.11 482.5H1536.83L1548.58 514H1544.12ZM1528.82 503.02H1540.12L1534.45 487.495L1528.82 503.02Z', cx: 1534, cy: 498 },
  { id: 'tag2', d: 'M1583.7 482.5V486.46H1574.39V514H1570.25V486.46H1560.98V482.5H1583.7Z', cx: 1572, cy: 498 },
  { id: 'tag3', d: 'M1588.28 495.28C1589.57 492.49 1591.91 491.095 1595.3 491.095V495.19C1593.38 495.1 1591.73 495.61 1590.35 496.72C1588.97 497.83 1588.28 499.615 1588.28 502.075V514H1584.36V491.5H1588.28V495.28Z', cx: 1589, cy: 502 },
  { id: 'tag4', d: 'M1614.65 491.5H1618.57V514H1614.65V510.76C1613.06 513.31 1610.63 514.585 1607.36 514.585C1604.72 514.585 1602.61 513.76 1601.02 512.11C1599.43 510.43 1598.63 508.165 1598.63 505.315V491.5H1602.55V505.09C1602.55 506.92 1603.04 508.345 1604.03 509.365C1605.02 510.355 1606.39 510.85 1608.13 510.85C1610.08 510.85 1611.65 510.25 1612.85 509.05C1614.05 507.82 1614.65 505.945 1614.65 503.425V491.5Z', cx: 1608, cy: 502 },
  { id: 'tag5', d: 'M1627.86 497.575C1627.86 498.445 1628.29 499.15 1629.16 499.69C1630.03 500.2 1631.08 500.62 1632.31 500.95C1633.54 501.25 1634.77 501.61 1636 502.03C1637.23 502.42 1638.28 503.11 1639.15 504.1C1640.02 505.06 1640.46 506.305 1640.46 507.835C1640.46 509.875 1639.66 511.51 1638.07 512.74C1636.51 513.97 1634.5 514.585 1632.04 514.585C1629.85 514.585 1627.98 514.105 1626.42 513.145C1624.86 512.185 1623.75 510.91 1623.09 509.32L1626.46 507.385C1626.82 508.465 1627.5 509.32 1628.49 509.95C1629.48 510.58 1630.66 510.895 1632.04 510.895C1633.33 510.895 1634.4 510.655 1635.24 510.175C1636.08 509.665 1636.5 508.885 1636.5 507.835C1636.5 506.965 1636.06 506.275 1635.19 505.765C1634.32 505.225 1633.27 504.805 1632.04 504.505C1630.81 504.175 1629.58 503.8 1628.35 503.38C1627.12 502.96 1626.07 502.27 1625.2 501.31C1624.33 500.35 1623.9 499.12 1623.9 497.62C1623.9 495.67 1624.65 494.065 1626.15 492.805C1627.68 491.545 1629.58 490.915 1631.86 490.915C1633.69 490.915 1635.31 491.335 1636.72 492.175C1638.16 492.985 1639.24 494.125 1639.96 495.595L1636.68 497.44C1635.87 495.52 1634.26 494.56 1631.86 494.56C1630.75 494.56 1629.81 494.83 1629.03 495.37C1628.25 495.88 1627.86 496.615 1627.86 497.575Z', cx: 1632, cy: 502 },
  { id: 'tag6', d: 'M1656.46 495.28H1650.47V507.475C1650.47 508.585 1650.68 509.38 1651.1 509.86C1651.55 510.31 1652.23 510.55 1653.13 510.58C1654.03 510.58 1655.14 510.55 1656.46 510.49V514C1653.04 514.45 1650.53 514.18 1648.94 513.19C1647.35 512.17 1646.56 510.265 1646.56 507.475V495.28H1642.1V491.5H1646.56V486.37L1650.47 485.2V491.5H1656.46V495.28Z', cx: 1649, cy: 499 },
  { id: 'tag7', d: 'M1662.69 504.55C1663.08 506.56 1664 508.12 1665.44 509.23C1666.91 510.34 1668.71 510.895 1670.84 510.895C1673.81 510.895 1675.97 509.8 1677.32 507.61L1680.65 509.5C1678.46 512.89 1675.16 514.585 1670.75 514.585C1667.18 514.585 1664.27 513.475 1662.02 511.255C1659.8 509.005 1658.69 506.17 1658.69 502.75C1658.69 499.36 1659.78 496.54 1661.97 494.29C1664.16 492.04 1667 490.915 1670.48 490.915C1673.78 490.915 1676.46 492.085 1678.53 494.425C1680.63 496.735 1681.68 499.525 1681.68 502.795C1681.68 503.365 1681.64 503.95 1681.55 504.55H1662.69ZM1670.48 494.605C1668.38 494.605 1666.64 495.205 1665.26 496.405C1663.88 497.575 1663.02 499.15 1662.69 501.13H1677.72C1677.39 499 1676.55 497.38 1675.2 496.27C1673.85 495.16 1672.28 494.605 1670.48 494.605Z', cx: 1670, cy: 502 },
  { id: 'tag8', d: 'M1704.77 482.5H1708.68V514H1704.77V510.13C1702.82 513.1 1699.98 514.585 1696.26 514.585C1693.11 514.585 1690.43 513.445 1688.21 511.165C1685.99 508.855 1684.88 506.05 1684.88 502.75C1684.88 499.45 1685.99 496.66 1688.21 494.38C1690.43 492.07 1693.11 490.915 1696.26 490.915C1699.98 490.915 1702.82 492.4 1704.77 495.37V482.5ZM1696.76 510.805C1699.04 510.805 1700.94 510.04 1702.47 508.51C1704 506.95 1704.77 505.03 1704.77 502.75C1704.77 500.47 1704 498.565 1702.47 497.035C1700.94 495.475 1699.04 494.695 1696.76 494.695C1694.51 494.695 1692.62 495.475 1691.09 497.035C1689.56 498.565 1688.79 500.47 1688.79 502.75C1688.79 505.03 1689.56 506.95 1691.09 508.51C1692.62 510.04 1694.51 510.805 1696.76 510.805Z', cx: 1696, cy: 498 },
  { id: 'tag9', d: 'M1534.81 537.5C1537.72 537.5 1540.13 538.475 1542.05 540.425C1544 542.345 1544.98 544.745 1544.98 547.625C1544.98 550.475 1544 552.875 1542.05 554.825C1540.13 556.775 1537.72 557.75 1534.81 557.75H1527.56V569H1523.38V537.5H1534.81ZM1534.81 553.835C1536.55 553.835 1537.99 553.25 1539.13 552.08C1540.27 550.88 1540.84 549.395 1540.84 547.625C1540.84 545.825 1540.27 544.34 1539.13 543.17C1537.99 542 1536.55 541.415 1534.81 541.415H1527.56V553.835H1534.81Z', cx: 1534, cy: 553 },
  { id: 'tag10', d: 'M1566.43 546.5H1570.34V569H1566.43V565.13C1564.48 568.1 1561.64 569.585 1557.92 569.585C1554.77 569.585 1552.09 568.445 1549.87 566.165C1547.65 563.855 1546.54 561.05 1546.54 557.75C1546.54 554.45 1547.65 551.66 1549.87 549.38C1552.09 547.07 1554.77 545.915 1557.92 545.915C1561.64 545.915 1564.48 547.4 1566.43 550.37V546.5ZM1558.42 565.805C1560.7 565.805 1562.6 565.04 1564.13 563.51C1565.66 561.95 1566.43 560.03 1566.43 557.75C1566.43 555.47 1565.66 553.565 1564.13 552.035C1562.6 550.475 1560.7 549.695 1558.42 549.695C1556.17 549.695 1554.28 550.475 1552.75 552.035C1551.22 553.565 1550.45 555.47 1550.45 557.75C1550.45 560.03 1551.22 561.95 1552.75 563.51C1554.28 565.04 1556.17 565.805 1558.42 565.805Z', cx: 1558, cy: 557 },
  { id: 'tag11', d: 'M1580.19 550.28C1581.48 547.49 1583.82 546.095 1587.21 546.095V550.19C1585.29 550.1 1583.64 550.61 1582.26 551.72C1580.88 552.83 1580.19 554.615 1580.19 557.075V569H1576.28V546.5H1580.19V550.28Z', cx: 1581, cy: 557 },
  { id: 'tag12', d: 'M1603.81 550.28H1597.82V562.475C1597.82 563.585 1598.03 564.38 1598.45 564.86C1598.9 565.31 1599.58 565.55 1600.48 565.58C1601.38 565.58 1602.49 565.55 1603.81 565.49V569C1600.39 569.45 1597.88 569.18 1596.29 568.19C1594.7 567.17 1593.91 565.265 1593.91 562.475V550.28H1589.45V546.5H1593.91V541.37L1597.82 540.2V546.5H1603.81V550.28Z', cx: 1596, cy: 554 },
  { id: 'tag13', d: 'M1619.78 545.915C1622.42 545.915 1624.54 546.755 1626.13 548.435C1627.72 550.085 1628.51 552.335 1628.51 555.185V569H1624.6V555.41C1624.6 553.58 1624.1 552.17 1623.11 551.18C1622.12 550.16 1620.76 549.65 1619.02 549.65C1617.07 549.65 1615.49 550.265 1614.29 551.495C1613.09 552.695 1612.49 554.555 1612.49 557.075V569H1608.58V546.5H1612.49V549.74C1614.08 547.19 1616.51 545.915 1619.78 545.915Z', cx: 1618, cy: 557 },
  { id: 'tag14', d: 'M1636.72 559.55C1637.11 561.56 1638.03 563.12 1639.47 564.23C1640.94 565.34 1642.74 565.895 1644.87 565.895C1647.84 565.895 1650 564.8 1651.35 562.61L1654.68 564.5C1652.49 567.89 1649.19 569.585 1644.78 569.585C1641.21 569.585 1638.3 568.475 1636.05 566.255C1633.83 564.005 1632.72 561.17 1632.72 557.75C1632.72 554.36 1633.81 551.54 1636 549.29C1638.19 547.04 1641.03 545.915 1644.51 545.915C1647.81 545.915 1640.49 547.085 1652.56 549.425C1654.66 551.735 1655.71 554.525 1655.71 557.795C1655.71 558.365 1655.67 558.95 1655.58 559.55H1636.72ZM1644.51 549.605C1642.41 549.605 1640.67 550.205 1639.29 551.405C1637.91 552.575 1637.05 554.15 1637.72 556.13H1651.75C1651.42 554 1650.58 552.38 1649.23 551.27C1647.88 550.16 1646.31 549.605 1644.51 549.605Z', cx: 1644, cy: 557 },
  { id: 'tag15', d: 'M1664.13 550.28C1665.42 547.49 1667.76 546.095 1671.15 546.095V550.19C1669.23 550.1 1667.58 550.61 1666.2 551.72C1664.82 552.83 1664.13 554.615 1664.13 557.075V569H1660.21V546.5H1664.13V550.28Z', cx: 1665, cy: 557 },
  { id: 'tag16', d: 'M1705.22 566.165C1702.91 568.445 1700.1 569.585 1696.8 569.585C1693.5 569.585 1690.7 568.445 1688.39 566.165C1686.11 563.885 1684.97 561.08 1684.97 557.75C1684.97 554.42 1686.11 551.615 1688.39 549.335C1690.7 547.055 1693.5 545.915 1696.8 545.915C1700.1 545.915 1702.91 547.055 1705.22 549.335C1707.53 551.615 1708.68 554.42 1708.68 557.75C1708.68 561.08 1707.53 563.885 1705.22 566.165ZM1696.8 565.76C1699.05 565.76 1700.94 564.995 1702.47 563.465C1704 561.935 1704.77 560.03 1704.77 557.75C1704.77 555.47 1704 553.565 1702.47 552.035C1700.94 550.505 1699.05 549.74 1696.8 549.74C1694.58 549.74 1692.71 550.505 1691.18 552.035C1689.65 553.565 1688.88 555.47 1688.88 557.75C1688.88 560.03 1689.65 561.935 1691.18 563.465C1692.71 564.995 1694.58 565.76 1696.8 565.76Z', cx: 1696, cy: 557 },
  { id: 'tag17', d: 'M1724.03 540.695C1720.07 540.365 1718.09 542.075 1718.09 545.825V546.5H1724.03V550.28H1718.09V569H1714.17V550.28H1710.57V546.5H1714.17V545.825C1714.17 542.795 1715.01 540.5 1716.69 538.94C1718.4 537.38 1720.85 536.705 1724.03 536.915V540.695Z', cx: 1717, cy: 553 },
  { id: 'tag18', d: 'M1531.56 624.585C1529.29 624.585 1527.28 624.105 1525.54 623.145C1523.8 622.185 1522.52 620.79 1521.71 618.96L1525.27 616.89C1526.2 619.29 1528.3 620.49 1531.56 620.49C1533.58 620.49 1535.15 620.01 1536.29 619.05C1537.43 618.09 1538 616.665 1538 614.775V592.5H1542.14V614.775C1542.14 617.925 1541.14 620.355 1539.13 622.065C1537.15 623.745 1534.63 624.585 1531.56 624.585Z', cx: 1531, cy: 608 },
  { id: 'tag19', d: 'M1568.33 624L1565.77 616.935H1551.59L1549.03 624H1544.57L1556.32 592.5H1561.04L1572.79 624H1568.33ZM1553.03 613.02H1564.33L1558.66 597.495L1553.03 613.02Z', cx: 1558, cy: 608 },
  { id: 'tag20', d: 'M1598.91 624H1594.14L1586.4 611.58L1578.66 624H1573.94L1584.06 607.8L1574.52 592.5H1579.25L1586.4 603.975L1593.56 592.5H1598.28L1588.79 607.755L1598.91 624Z', cx: 1586, cy: 608 },
  { id: 'tag21', d: 'M1632.52 592.5V624H1628.38V599.385L1618.08 616.53H1617.54L1607.23 599.43V624H1603.05V592.5H1607.77L1617.81 609.15L1627.8 592.5H1632.52Z', cx: 1617, cy: 608 },
  { id: 'tag22', d: 'M1660 624L1657.44 616.935H1643.26L1640.7 624H1636.24L1647.99 592.5H1652.71L1664.46 624H1660ZM1644.7 613.02H1656L1650.33 597.495L1644.7 613.02Z', cx: 1650, cy: 608 },
  { id: 'tag23', d: 'M1686.85 624L1679.78 611.94H1672.36V624H1668.17V592.5H1680.77C1683.47 592.5 1685.78 593.46 1687.7 595.38C1689.62 597.27 1690.58 599.565 1690.58 602.265C1690.58 604.305 1689.97 606.165 1688.74 607.845C1687.54 609.525 1685.98 610.71 1684.06 611.4L1691.48 624H1686.85Z', cx: 1679, cy: 608 },
  { id: 'tag24', d: 'M1715.19 592.5V596.46H1705.87V624H1701.73V596.46H1692.46V592.5H1715.19Z', cx: 1703, cy: 608 },
];

// ─── Fractured JLT Shards (20 Polygons covering JLT) ───
const JLT_SHARDS = [
  { id: 'j_shard_1', path: 'M1147 432 L1175 432 L1175 460 L1147 460 Z', cx: 1161, cy: 446, color: 'white' },
  { id: 'j_shard_2', path: 'M1175 432 L1201 432 L1201 460 L1175 460 Z', cx: 1188, cy: 446, color: 'url(#hero_paint_j)' },
  { id: 'j_shard_3', path: 'M1147 460 L1201 460 L1201 490 L1147 490 Z', cx: 1174, cy: 475, color: 'white' },
  { id: 'j_shard_4', path: 'M1147 500 L1201 500 L1201 560 L1147 560 Z', cx: 1174, cy: 530, color: 'url(#hero_paint_j)' },
  { id: 'j_shard_5', path: 'M1147 560 L1201 560 L1201 620 L1147 620 Z', cx: 1174, cy: 590, color: 'white' },
  { id: 'j_shard_6', path: 'M1147 620 L1201 620 L1201 687 L1147 687 Z', cx: 1174, cy: 653, color: 'url(#hero_paint_j)' },
  { id: 'j_shard_7', path: 'M1107 703 L1147 703 L1147 758 L1107 758 Z', cx: 1127, cy: 730, color: 'white' },

  { id: 'l_shard_1', path: 'M1231 436 L1285 436 L1285 490 L1231 490 Z', cx: 1258, cy: 463, color: 'white' },
  { id: 'l_shard_2', path: 'M1231 490 L1285 490 L1285 550 L1231 550 Z', cx: 1258, cy: 520, color: 'url(#hero_paint_l)' },
  { id: 'l_shard_3', path: 'M1231 550 L1285 550 L1285 610 L1231 610 Z', cx: 1258, cy: 580, color: 'white' },
  { id: 'l_shard_4', path: 'M1231 610 L1285 610 L1285 673 L1231 673 Z', cx: 1258, cy: 641, color: 'url(#hero_paint_l)' },

  { id: 't_shard_1', path: 'M1336 452 L1390 452 L1390 499 L1336 499 Z', cx: 1363, cy: 475, color: 'white' },
  { id: 't_shard_2', path: 'M1302 499 L1377 499 L1377 541 L1339 541 Z', cx: 1339, cy: 520, color: 'url(#hero_paint6)' },
  { id: 't_shard_3', path: 'M1377 499 L1425 499 L1425 541 L1377 541 Z', cx: 1401, cy: 520, color: 'white' },
  { id: 't_shard_4', path: 'M1328 541 L1384 541 L1384 593 L1328 593 Z', cx: 1356, cy: 567, color: 'url(#hero_paint6)' },
  { id: 't_shard_5', path: 'M1384 541 L1466 541 L1466 593 L1384 593 Z', cx: 1425, cy: 567, color: 'white' },
  { id: 't_shard_6', path: 'M1300 593 L1384 593 L1384 649 L1300 649 Z', cx: 1342, cy: 621, color: 'url(#hero_paint6)' },
  { id: 't_shard_7', path: 'M1384 593 L1466 593 L1466 679 L1384 679 Z', cx: 1425, cy: 636, color: 'white' },
];



export default function Splash({ onClick, onStartTransition, onComplete }: SplashProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const mascotFullRef = useRef<HTMLImageElement>(null);
  const mascotPartsRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const jltSolidRef = useRef<SVGGElement>(null);
  const jltShardsGroupRef = useRef<SVGGElement>(null);
  const welcomeGroupRef = useRef<SVGGElement>(null);
  const taglineGroupRef = useRef<SVGGElement>(null);

  const [isTransitioning, setIsTransitioning] = useState(false);

  // SVG Mask Group references for 120 FPS GPU transform scale
  const mask0GroupRef = useRef<SVGGElement>(null);
  const mask1GroupRef = useRef<SVGGElement>(null);
  const mask2GroupRef = useRef<SVGGElement>(null);
  const mask3GroupRef = useRef<SVGGElement>(null);

  // Glow container references
  const glow0Ref = useRef<SVGGElement>(null);
  const glow1Ref = useRef<SVGGElement>(null);
  const glow2Ref = useRef<SVGGElement>(null);
  const glow3Ref = useRef<SVGGElement>(null);

  // Lock body scroll while Splash screen is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // ─── Click Handler: 120 FPS Ultra-Smooth Transition ───
  const handleSplashClick = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    onStartTransition?.();

    if (containerRef.current) {
      containerRef.current.style.pointerEvents = 'none';
    }

    const startTime = performance.now();
    const durationTotal = 1300; // Total transition timeline duration (ms)

    // Pre-cache DOM query references for zero allocation inside 120 FPS loop
    const shardElems = Array.from(jltShardsGroupRef.current?.querySelectorAll<SVGPathElement>('.jlt-shard') || []);
    const shardsData = shardElems.map(() => ({
      vx: (Math.random() - 0.5) * 340,
      vy: (Math.random() - 0.5) * 190 - 70,
      rotSpeed: (Math.random() - 0.5) * 720,
    }));

    const partElems = Array.from(mascotPartsRef.current?.querySelectorAll<HTMLDivElement>('.mascot-part') || []);
    const partsData = partElems.map(() => ({
      vx: (Math.random() - 0.5) * 400,
      vy: -160 - Math.random() * 180,
      rotSpeed: (Math.random() - 0.5) * 520,
    }));

    const welcomeLetterElems = Array.from(welcomeGroupRef.current?.querySelectorAll<SVGPathElement>('.welcome-letter') || []);
    const welcomeData = welcomeLetterElems.map(() => ({
      vx: (Math.random() - 0.5) * 180,
      vy: -30 - Math.random() * 90,
      rotSpeed: (Math.random() - 0.5) * 200,
      delay: Math.random() * 100,
    }));

    const taglineLetterElems = Array.from(taglineGroupRef.current?.querySelectorAll<SVGPathElement>('.tagline-letter') || []);
    const taglineData = taglineLetterElems.map(() => ({
      vx: (Math.random() - 0.5) * 200,
      vy: -30 - Math.random() * 100,
      rotSpeed: (Math.random() - 0.5) * 240,
      delay: Math.random() * 120,
    }));

    let animationFrameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationTotal);

      // ─── Step 1: Hide CTA ───
      if (ctaRef.current) {
        const ctaP = Math.min(1, elapsed / 130);
        ctaRef.current.style.opacity = `${1 - ctaP}`;
        ctaRef.current.style.transform = `translate3d(-50%, 0, 0) scale3d(${1 - 0.2 * ctaP}, ${1 - 0.2 * ctaP}, 1)`;
      }

      // ─── Step 2: 120 FPS GPU Accelerated SVG Background Dissolve ───
      // Mask groups shrink toward centroids using GPU transform scale3d
      const m0P = Math.max(0, Math.min(1, (elapsed - 40) / 580));
      const m1P = Math.max(0, Math.min(1, (elapsed - 100) / 600));
      const m2P = Math.max(0, Math.min(1, (elapsed - 160) / 600));
      const m3P = Math.max(0, Math.min(1, (elapsed - 220) / 600));

      const s0 = 1 - easeOrganic(m0P);
      const s1 = 1 - easeOrganic(m1P);
      const s2 = 1 - easeOrganic(m2P);
      const s3 = 1 - easeOrganic(m3P);

      if (mask0GroupRef.current) mask0GroupRef.current.style.transform = `translate3d(1934px, 35px, 0) scale3d(${s0}, ${s0}, 1) translate3d(-1934px, -35px, 0)`;
      if (mask1GroupRef.current) mask1GroupRef.current.style.transform = `translate3d(1934px, 1690px, 0) scale3d(${s1}, ${s1}, 1) translate3d(-1934px, -1690px, 0)`;
      if (mask2GroupRef.current) mask2GroupRef.current.style.transform = `translate3d(150px, -170px, 0) scale3d(${s2}, ${s2}, 1) translate3d(-150px, 170px, 0)`;
      if (mask3GroupRef.current) mask3GroupRef.current.style.transform = `translate3d(-260px, 1600px, 0) scale3d(${s3}, ${s3}, 1) translate3d(260px, -1600px, 0)`;

      // ─── Step 3: Logo Break (at ~240ms) ───
      if (elapsed >= 240) {
        if (jltSolidRef.current && jltSolidRef.current.style.display !== 'none') {
          jltSolidRef.current.style.display = 'none';
        }
        if (jltShardsGroupRef.current && jltShardsGroupRef.current.style.display !== 'block') {
          jltShardsGroupRef.current.style.display = 'block';
        }

        const dt = (elapsed - 240) / 1000;
        for (let i = 0; i < shardElems.length; i++) {
          const shard = shardElems[i];
          const data = shardsData[i];
          const x = data.vx * dt;
          const y = data.vy * dt + 0.5 * 1550 * dt * dt;
          const rot = data.rotSpeed * dt;
          const fade = Math.max(0, 1 - dt / 0.85);

          shard.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;
          shard.style.opacity = `${fade}`;
        }
      }

      // ─── Step 4: Mascot Physics (Anticipation -> Squash -> Break & Fall) ───
      if (mascotFullRef.current && mascotPartsRef.current) {
        if (elapsed < 140) {
          const p = elapsed / 140;
          const scale = 1 + 0.08 * p;
          mascotFullRef.current.style.transform = `translate3d(-50%, -50%, 0) scale3d(${scale}, ${scale}, 1)`;
        } else if (elapsed < 230) {
          const p = (elapsed - 140) / 90;
          const sx = 1.08 + 0.12 * p;
          const sy = 1.08 - 0.26 * p;
          mascotFullRef.current.style.transform = `translate3d(-50%, -50%, 0) scale3d(${sx}, ${sy}, 1)`;
        } else {
          if (mascotFullRef.current.style.opacity !== '0') mascotFullRef.current.style.opacity = '0';
          if (mascotPartsRef.current.style.display !== 'block') mascotPartsRef.current.style.display = 'block';

          const dt = (elapsed - 230) / 1000;
          for (let i = 0; i < partElems.length; i++) {
            const part = partElems[i];
            const data = partsData[i];
            const x = data.vx * dt;
            const y = data.vy * dt + 0.5 * 1650 * dt * dt;
            const rot = data.rotSpeed * dt;
            const fade = Math.max(0, 1 - dt / 0.85);

            part.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;
            part.style.opacity = `${fade}`;
          }
        }
      }

      // ─── Step 5: Text Collapse (Split Letters Drop with Gravity) ───
      if (elapsed >= 250) {
        for (let i = 0; i < welcomeLetterElems.length; i++) {
          const letter = welcomeLetterElems[i];
          const data = welcomeData[i];
          if (elapsed >= 250 + data.delay) {
            const dt = (elapsed - 250 - data.delay) / 1000;
            const x = data.vx * dt;
            const y = data.vy * dt + 0.5 * 1450 * dt * dt;
            const rot = data.rotSpeed * dt;
            const fade = Math.max(0, 1 - dt / 0.75);

            letter.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;
            letter.style.opacity = `${fade}`;
          }
        }

        for (let i = 0; i < taglineLetterElems.length; i++) {
          const letter = taglineLetterElems[i];
          const data = taglineData[i];
          if (elapsed >= 250 + data.delay) {
            const dt = (elapsed - 250 - data.delay) / 1000;
            const x = data.vx * dt;
            const y = data.vy * dt + 0.5 * 1450 * dt * dt;
            const rot = data.rotSpeed * dt;
            const fade = Math.max(0, 1 - dt / 0.75);

            letter.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;
            letter.style.opacity = `${fade}`;
          }
        }
      }

      // ─── Step 6: Black Panel Exit (Retract Corners & Shrink Vertically) ───
      if (elapsed >= 580 && svgRef.current) {
        const p = Math.min(1, (elapsed - 580) / 440);
        const sy = 1 - easeOrganic(p);
        svgRef.current.style.transform = `scale3d(1, ${sy}, 1)`;
        svgRef.current.style.borderRadius = `${120 * p}px`;
      }

      // ─── Step 7: Purple Glow Dissipation ───
      if (elapsed >= 480) {
        const glowP = Math.min(1, (elapsed - 480) / 440);
        const opacity = Math.max(0, 1 - glowP);
        const scale = 1 + 0.3 * glowP;

        [glow0Ref.current, glow1Ref.current, glow2Ref.current, glow3Ref.current].forEach((glow) => {
          if (glow) {
            glow.style.opacity = `${opacity}`;
            glow.style.transform = `scale3d(${scale}, ${scale}, 1)`;
          }
        });
      }

      // ─── Step 8: Transition Complete (Unmount Overlay) ───
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        onClick?.();
        onComplete?.();
      }
    };

    animationFrameId = requestAnimationFrame(tick);
  }, [isTransitioning, onClick, onStartTransition, onComplete]);

  // Auto-transition to main landing page after a brief delay (800ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSplashClick();
    }, 800);
    return () => clearTimeout(timer);
  }, [handleSplashClick]);

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      onClick={handleSplashClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleSplashClick();
        }
      }}
      className="relative w-screen h-screen overflow-hidden bg-black cursor-pointer select-none flex items-center justify-center"
      aria-label="Welcome Splash Screen. Click anywhere to enter."
      style={{ willChange: 'transform, opacity' }}
    >
      {/* ─── Exact Figma SVG Background with Organic Dissolve Masks ─── */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        aria-hidden="true"
        style={{
          pointerEvents: 'none',
          zIndex: 1,
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      >
        <defs>
          {/* Organic Dissolve Masks for SVG Background Blobs */}
          <mask id="dissolve_mask_0">
            <rect width="1920" height="1080" fill="black" />
            <g ref={mask0GroupRef} style={{ willChange: 'transform' }}>
              <circle cx="1934" cy="35" r="1600" fill="white" filter="url(#mask_blur)" />
            </g>
          </mask>

          <mask id="dissolve_mask_1">
            <rect width="1920" height="1080" fill="black" />
            <g ref={mask1GroupRef} style={{ willChange: 'transform' }}>
              <circle cx="1934" cy="1690" r="1600" fill="white" filter="url(#mask_blur)" />
            </g>
          </mask>

          <mask id="dissolve_mask_2">
            <rect width="1920" height="1080" fill="black" />
            <g ref={mask2GroupRef} style={{ willChange: 'transform' }}>
              <circle cx="150" cy="-170" r="1600" fill="white" filter="url(#mask_blur)" />
            </g>
          </mask>

          <mask id="dissolve_mask_3">
            <rect width="1920" height="1080" fill="black" />
            <g ref={mask3GroupRef} style={{ willChange: 'transform' }}>
              <circle cx="-260" cy="1600" r="1800" fill="white" filter="url(#mask_blur)" />
            </g>
          </mask>

          {/* Mask Soft Edge Feather Filter */}
          <filter id="mask_blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="35" />
          </filter>

          {/* Glow Filters */}
          <filter id="hero_filter0" x="763.729" y="-870.433" width="2342.03" height="1804.15" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feMorphology radius="31.1442" operator="dilate" in="SourceAlpha" result="effect1_dropShadow" />
            <feOffset />
            <feGaussianBlur stdDeviation="31.1442" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </filter>

          <filter id="hero_filter1" x="800.533" y="828.369" width="2268.42" height="1730.55" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feMorphology radius="18.8771" operator="dilate" in="SourceAlpha" result="effect1_dropShadow" />
            <feOffset />
            <feGaussianBlur stdDeviation="18.8771" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </filter>

          <filter id="hero_filter2" x="-1476.59" y="-931.81" width="2428.62" height="3619.96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feMorphology radius="44.2911" operator="dilate" in="SourceAlpha" result="effect1_dropShadow" />
            <feOffset />
            <feGaussianBlur stdDeviation="44.2911" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </filter>

          {/* Gradients */}
          <linearGradient id="hero_paint0" x1="2830.45" y1="774.846" x2="2410.18" y2="-803.772" gradientUnits="userSpaceOnUse">
            <stop stopColor="#340073" />
            <stop offset="0.496014" stopColor="#360C9F" />
            <stop offset="1" stopColor="#FFA28D" />
          </linearGradient>
          <linearGradient id="hero_paint1" x1="2909.76" y1="1376.02" x2="2631.77" y2="48.066" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFA28D" />
            <stop offset="0.503986" stopColor="#360C9F" />
            <stop offset="1" stopColor="#340073" />
          </linearGradient>
          <linearGradient id="hero_paint2" x1="1041.93" y1="-707.418" x2="-1935.33" y2="324.078" gradientUnits="userSpaceOnUse">
            <stop stopColor="#340073" />
            <stop offset="0.496014" stopColor="#360C9F" />
            <stop offset="1" stopColor="#FFA28D" />
          </linearGradient>
          <linearGradient id="hero_paint3" x1="1041.93" y1="-707.418" x2="-1935.33" y2="324.078" gradientUnits="userSpaceOnUse">
            <stop stopColor="#340073" />
            <stop offset="0.496014" stopColor="#360C9F" />
            <stop offset="1" stopColor="#FFA28D" />
          </linearGradient>
          <linearGradient id="hero_paint6" x1="1435.94" y1="692.081" x2="1367.28" y2="430.864" gradientUnits="userSpaceOnUse">
            <stop stopColor="#340073" />
            <stop offset="0.496014" stopColor="#360C9F" />
            <stop offset="1" stopColor="#FFA28D" />
          </linearGradient>
          <linearGradient id="hero_paint_j" x1="1174.94" y1="692.081" x2="1106.28" y2="430.864" gradientUnits="userSpaceOnUse">
            <stop stopColor="#340073" />
            <stop offset="0.496014" stopColor="#360C9F" />
            <stop offset="1" stopColor="#FFA28D" />
          </linearGradient>
          <linearGradient id="hero_paint_l" x1="1265.94" y1="692.081" x2="1197.28" y2="430.864" gradientUnits="userSpaceOnUse">
            <stop stopColor="#340073" />
            <stop offset="0.496014" stopColor="#360C9F" />
            <stop offset="1" stopColor="#FFA28D" />
          </linearGradient>

          <clipPath id="hero_clip0">
            <rect width="1920" height="1080" fill="white" />
          </clipPath>
        </defs>

        <g clipPath="url(#hero_clip0)">
          <rect width="1920" height="1080" fill="black" />

          {/* Top-Right Background Glow (Masked for Dissolve) */}
          <g ref={glow0Ref} filter="url(#hero_filter0)" mask="url(#dissolve_mask_0)" style={{ willChange: 'transform, opacity', transformOrigin: '1934px 35px' }}>
            <path
              d="M857.161 141.241C857.161 211.293 927.693 268.081 1014.7 268.081H1634.9C1729.95 268.081 1777.48 268.081 1807.01 291.858C1836.54 315.634 1836.54 353.902 1836.54 430.437L1836.54 713.448C1836.54 783.5 1907.07 840.288 1994.08 840.288L2854.79 840.288C2941.79 840.288 3012.32 783.5 3012.32 713.448V68.233C3012.32 -1.81897 2941.79 -58.6073 2854.79 -58.6073H2286.7C2191.64 -58.6073 2144.11 -58.6073 2114.58 -82.3837C2085.05 -106.16 2085.05 -144.428 2085.05 -220.963V-650.16C2085.05 -720.212 2014.52 -777 1927.51 -777L1014.7 -777C927.693 -777 857.161 -720.212 857.161 -650.16L857.161 141.241Z"
              fill="url(#hero_paint0)"
            />
          </g>

          {/* Bottom-Right Background Glow (Masked for Dissolve) */}
          <g ref={glow1Ref} filter="url(#hero_filter1)" mask="url(#dissolve_mask_1)" style={{ willChange: 'transform, opacity', transformOrigin: '1934px 1690px' }}>
            <path
              d="M857.164 1785C857.164 1853.68 945.098 1909.35 1053.57 1909.35H1575.96C1675.09 1909.35 1724.65 1909.35 1755.44 1928.85C1786.24 1948.34 1786.24 1979.72 1786.24 2042.48V2398.28C1786.24 2455.72 1859.79 2502.29 1950.51 2502.29H2848.05C2938.78 2502.29 3012.33 2455.72 3012.33 2398.28V1869.23C3012.33 1811.79 2938.78 1765.22 2848.05 1765.22H2585.48C2486.35 1765.22 2436.79 1765.22 2406 1745.73C2375.2 1726.23 2375.2 1694.85 2375.2 1632.1V1009.35C2375.2 940.672 2287.27 885 2178.8 885L1053.57 885C945.098 885 857.164 940.672 857.164 1009.35L857.164 1785Z"
              fill="url(#hero_paint1)"
            />
          </g>

          {/* Left/Bottom-Left Background Glows (Masked for Dissolve) */}
          <g ref={glow2Ref} filter="url(#hero_filter2)" mask="url(#dissolve_mask_2)" style={{ willChange: 'transform, opacity', transformOrigin: '150px -170px' }}>
            <path
              d="M568.96 450C707.142 450 819.161 343.093 819.161 211.216L819.161 -560.153C819.161 -692.029 707.142 -798.937 568.96 -798.937L-269.489 -798.937C-407.671 -798.937 -519.69 -692.029 -519.69 -560.153L-519.69 211.216C-519.69 343.093 -407.671 450 -269.489 450L568.96 450Z"
              fill="url(#hero_paint2)"
            />
          </g>
          <g ref={glow3Ref} filter="url(#hero_filter2)" mask="url(#dissolve_mask_3)" style={{ willChange: 'transform, opacity', transformOrigin: '-260px 1600px' }}>
            <path
              d="M-627.825 2555.28C-489.643 2555.28 -377.624 2448.37 -377.624 2316.5L-377.624 1995.7C-377.624 1935.76 -301.787 1895.44 -238.977 1895.44H558.087C696.269 1895.44 808.288 1788.53 808.288 1656.65V885.284C808.288 753.408 696.269 646.5 558.087 646.5L-238.977 646.5C-284.144 646.5 -326.516 657.922 -363.094 677.905C-435.9 717.68 -543.935 744.994 -627.825 744.994H-1093.52C-1231.7 744.994 -1343.72 851.901 -1343.72 983.778L-1343.72 2316.5C-1343.72 2448.37 -1231.7 2555.28 -1093.52 2555.28H-627.825Z"
              fill="url(#hero_paint3)"
            />
          </g>

          {/* ─── "WELCOME TO" text split into individual letter paths ─── */}
          <g ref={welcomeGroupRef}>
            {WELCOME_LETTERS.map((letter) => (
              <path
                key={letter.id}
                className="welcome-letter"
                d={letter.d}
                fill="white"
                style={{ transformOrigin: `${letter.cx}px ${letter.cy}px`, willChange: 'transform, opacity' }}
              />
            ))}
          </g>

          {/* ─── "A TRUSTED PARTNER OF JAXMART" text split into individual letter paths ─── */}
          <g ref={taglineGroupRef}>
            {TAGLINE_LETTERS.map((letter) => (
              <path
                key={letter.id}
                className="tagline-letter"
                d={letter.d}
                fill="white"
                style={{ transformOrigin: `${letter.cx}px ${letter.cy}px`, willChange: 'transform, opacity' }}
              />
            ))}
          </g>

          {/* ─── JLT Solid Logo ─── */}
          <g ref={jltSolidRef}>
            <path
              d="M1147.79 459.046C1147.79 442.822 1158.61 432.006 1174.83 432.006C1191.06 432.006 1201.87 442.822 1201.87 459.046C1201.87 475.27 1191.06 486.086 1174.83 486.086C1158.61 486.086 1147.79 475.27 1147.79 459.046ZM1147.79 686.858V499.606H1201.87V687.872C1201.87 755.472 1165.71 757.838 1107.57 757.838V703.758H1125.49C1145.09 703.758 1147.79 695.984 1147.79 686.858Z"
              transform="translate(13, 0)"
              fill="url(#hero_paint_j)"
            />
            <path
              d="M1218.81 673V436.4H1272.89V673H1218.81Z"
              transform="translate(13, 0)"
              fill="url(#hero_paint_l)"
            />
            <path
              d="M1412.29 593.57H1466.37C1466.37 649.678 1435.27 679.76 1384.91 679.76C1303.45 679.76 1279.79 591.542 1328.13 541.856H1302.78V499.606H1336.91V452.624H1390.99V499.606H1425.13V541.856C1342.66 541.856 1342.66 625.68 1384.91 625.68C1402.82 625.68 1412.29 612.16 1412.29 593.57Z"
              fill="url(#hero_paint6)"
            />
            <path
              d="M1147.79 459.046C1147.79 442.822 1158.61 432.006 1174.83 432.006C1191.06 432.006 1201.87 442.822 1201.87 459.046C1201.87 475.27 1191.06 486.086 1174.83 486.086C1158.61 486.086 1147.79 475.27 1147.79 459.046ZM1147.79 686.858V499.606H1201.87V687.872C1201.87 755.472 1165.71 757.838 1107.57 757.838V703.758H1125.49C1145.09 703.758 1147.79 695.984 1147.79 686.858ZM1218.81 673V436.4H1272.89V673H1218.81ZM1399.29 593.57H1453.37C1453.37 649.678 1422.27 679.76 1371.91 679.76C1290.45 679.76 1266.79 591.542 1315.13 541.856H1289.78V499.606H1323.91V452.624H1377.99V499.606H1412.13V541.856C1329.66 541.856 1329.66 625.68 1371.91 625.68C1389.82 625.68 1399.29 612.16 1399.29 593.57Z"
              fill="white"
            />
          </g>

          {/* ─── JLT Fractured Shards Group (Hidden initially) ─── */}
          <g ref={jltShardsGroupRef} style={{ display: 'none' }}>
            {JLT_SHARDS.map((shard) => (
              <path
                key={shard.id}
                className="jlt-shard"
                d={shard.path}
                fill={shard.color}
                style={{ transformOrigin: `${shard.cx}px ${shard.cy}px`, willChange: 'transform, opacity' }}
              />
            ))}
          </g>
        </g>
      </svg>

      {/* ─── Edge Vignette Overlay ─── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 55% 55% at 0% 0%,    rgba(0,0,0,0.75) 0%, transparent 70%),
            radial-gradient(ellipse 55% 55% at 100% 0%,  rgba(0,0,0,0.75) 0%, transparent 70%),
            radial-gradient(ellipse 55% 55% at 0% 100%,  rgba(0,0,0,0.75) 0%, transparent 70%),
            radial-gradient(ellipse 55% 55% at 100% 100%,rgba(0,0,0,0.75) 0%, transparent 70%),
            linear-gradient(to right, rgba(0,0,0,0.45) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.45) 100%),
            linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 15%, transparent 80%, rgba(0,0,0,0.65) 100%)
          `,
        }}
      />

      {/* ─── Mascot (Full Character Intact) ─── */}
      <img
        ref={mascotFullRef}
        src="/optimized/mascot.webp"
        alt="JLT Quest Mascot"
        aria-label="JLT Quest Mascot character"
        width={780}
        height={780}
        decoding="async"
        fetchPriority="high"
        className="absolute left-[50%] md:left-[47%] top-[50%] md:top-[53%] -translate-x-[50%] -translate-y-[50%] w-[55vw] sm:w-[40vw] md:w-[24vw] max-w-[460px] h-auto object-contain z-10 pointer-events-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] animate-float"
        style={{ transformOrigin: 'center center', willChange: 'transform, opacity' }}
      />

      {/* ─── Mascot Separated Anatomical Parts (Hidden initially) ─── */}
      <div
        ref={mascotPartsRef}
        className="absolute left-[50%] md:left-[47%] top-[50%] md:top-[53%] -translate-x-[50%] -translate-y-[50%] w-[55vw] sm:w-[40vw] md:w-[24vw] max-w-[460px] aspect-square z-10 pointer-events-none"
        style={{ display: 'none' }}
      >
        {/* Head */}
        <div
          className="mascot-part absolute inset-0 bg-no-repeat bg-contain"
          style={{
            backgroundImage: 'url(/optimized/mascot.webp)',
            clipPath: 'polygon(24% 0%, 76% 0%, 76% 32%, 24% 32%)',
            transformOrigin: '50% 16%',
            willChange: 'transform, opacity',
          }}
        />
        {/* Left Ear */}
        <div
          className="mascot-part absolute inset-0 bg-no-repeat bg-contain"
          style={{
            backgroundImage: 'url(/optimized/mascot.webp)',
            clipPath: 'polygon(0% 0%, 28% 0%, 28% 30%, 0% 30%)',
            transformOrigin: '14% 15%',
            willChange: 'transform, opacity',
          }}
        />
        {/* Right Ear */}
        <div
          className="mascot-part absolute inset-0 bg-no-repeat bg-contain"
          style={{
            backgroundImage: 'url(/optimized/mascot.webp)',
            clipPath: 'polygon(72% 0%, 100% 0%, 100% 30%, 72% 30%)',
            transformOrigin: '86% 15%',
            willChange: 'transform, opacity',
          }}
        />
        {/* Left Arm */}
        <div
          className="mascot-part absolute inset-0 bg-no-repeat bg-contain"
          style={{
            backgroundImage: 'url(/optimized/mascot.webp)',
            clipPath: 'polygon(0% 30%, 35% 30%, 35% 65%, 0% 65%)',
            transformOrigin: '17% 48%',
            willChange: 'transform, opacity',
          }}
        />
        {/* Right Arm */}
        <div
          className="mascot-part absolute inset-0 bg-no-repeat bg-contain"
          style={{
            backgroundImage: 'url(/optimized/mascot.webp)',
            clipPath: 'polygon(65% 30%, 100% 30%, 100% 65%, 65% 65%)',
            transformOrigin: '83% 48%',
            willChange: 'transform, opacity',
          }}
        />
        {/* Body & Legs */}
        <div
          className="mascot-part absolute inset-0 bg-no-repeat bg-contain"
          style={{
            backgroundImage: 'url(/optimized/mascot.webp)',
            clipPath: 'polygon(25% 30%, 75% 30%, 100% 100%, 0% 100%)',
            transformOrigin: '50% 65%',
            willChange: 'transform, opacity',
          }}
        />
      </div>

      {/* ─── Click / Tap Cue CTA ─── */}
      <div
        ref={ctaRef}
        aria-hidden="true"
        className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 animate-bounce cursor-pointer"
        style={{ willChange: 'transform, opacity' }}
      >
        <span className="font-gilroyMedium text-[11px] sm:text-xs text-white/60 tracking-[0.25em] uppercase glass-pill px-4 py-1.5 border border-white/10 shadow-lg">
          CLICK OR TAP ANYWHERE TO ENTER
        </span>
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.6)" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* ─── Keyframes ─── */}
      <style>{`
        @keyframes mascotFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(6px); }
        }
      `}</style>
    </div>
  );
}
