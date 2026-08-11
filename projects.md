---
layout: default
title: Research Projects
permalink: /projects/
---

<section class="section wrap" style="border-bottom:none; padding-bottom:0;">
  <div class="section-head">
    <span class="section-eyebrow">Research Projects</span>
    <h2>연구과제</h2>
    <p class="section-sub">
      APCL에서 수행한 주요 정부 및 산학연 연구과제 목록입니다.
    </p>
  </div>
</section>

<section class="section wrap">
  <div class="project-list" id="projectList">
    {% for project in site.data.projects.projects %}
    <article class="project-item">
      <div class="project-period">{{ project.period }}</div>
      <div class="project-body">
        <h3>{{ project.title }}</h3>
        <div class="project-meta">
          <span>{{ project.program }}</span>
          <span>{{ project.agency }}</span>
        </div>
        {% if project.keywords %}
        <div class="project-keywords" aria-label="Keywords">
          {% for keyword in project.keywords %}
          <span>{{ keyword }}</span>
          {% endfor %}
        </div>
        {% endif %}
      </div>
    </article>
    {% endfor %}
  </div>
  <div class="board-pagination" id="projectPagination"></div>
</section>
