from abc import ABC, abstractmethod
from typing import List, Callable, Optional, Awaitable
from backend.app.models import AgentTask, OpportunityRaw, Opportunity, StudentProfile

ProgressCallback = Callable[[str], Awaitable[None]]

class WebAgentClient(ABC):
    """
    Abstract interface for autonomous web agents.
    Supports both simulated MockClient and live TinyFish client.
    """

    @abstractmethod
    async def discover(
        self,
        task: AgentTask,
        profile: StudentProfile,
        on_progress: Optional[ProgressCallback] = None
    ) -> List[OpportunityRaw]:
        """Stage A: Discovers opportunity listings from a web portal."""
        pass

    @abstractmethod
    async def extract_detail(
        self,
        task: AgentTask,
        raw: OpportunityRaw,
        on_progress: Optional[ProgressCallback] = None
    ) -> Opportunity:
        """Stage B: Extracts deep criteria, deadlines, and official links."""
        pass
